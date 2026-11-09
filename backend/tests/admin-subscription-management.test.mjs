import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { subscriptionsRouter } from "../dist/routes/subscriptions.routes.js";

function routeHandler(method, path) {
  const route = subscriptionsRouter.stack.find(
    (layer) => layer.route?.path === path && layer.route.methods[method],
  ).route;
  return route.stack.at(-1).handle;
}

async function invoke(handler, req) {
  const result = { status: 200 };
  await handler(
    req,
    {
      status(code) {
        result.status = code;
        return this;
      },
      json(body) {
        result.body = body;
      },
    },
    (error) => {
      result.error = error;
    },
  );
  return result;
}

function mockClient({
  profile = {
    id: "00000000-0000-4000-8000-000000000001",
    email: "owner@example.test",
    full_name: "Example Owner",
    mobile: "9876543210",
    auto_lead_contact: true,
  },
  subscription = null,
  rpcError = null,
} = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const call = { table };
      calls.push(call);
      const query = {
        select(columns, options) {
          call.columns = columns;
          call.options = options;
          return this;
        },
        ilike(column, value) {
          call.filter = [column, value];
          return this;
        },
        eq(column, value) {
          call.filter = [column, value];
          return this;
        },
        update(payload) {
          call.update = payload;
          return this;
        },
        async maybeSingle() {
          if (table === "profiles") return { data: profile, error: null };
          if (table === "subscriptions") {
            return { data: call.update ? { ...subscription, ...call.update } : subscription, error: null };
          }
          return { data: null, error: null };
        },
        then(resolve, reject) {
          return Promise.resolve({ count: 3, error: null }).then(resolve, reject);
        },
      };
      return query;
    },
    async rpc(name, args) {
      calls.push({ rpc: name, args });
      return { data: rpcError ? null : { id: "subscription-id" }, error: rpcError };
    },
  };
}

test("admin email lookup previews the matching user and existing plan details", async () => {
  const client = mockClient({
    subscription: {
      id: "subscription-id",
      plan_name: "VENUES LOCATION Verified Listing",
      amount: 3650,
      status: "active",
      started_on: "2026-01-01",
      expires_on: "2027-01-01",
      invoice_number: "OMS/INV/2026/1",
    },
  });
  const result = await invoke(routeHandler("get", "/admin-preview"), {
    query: { email: " OWNER@EXAMPLE.TEST " },
    client,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.body.account.id, "00000000-0000-4000-8000-000000000001");
  assert.equal(result.body.account.email, "owner@example.test");
  assert.equal(result.body.account.auto_lead_contact, true);
  assert.equal(result.body.subscription.plan_name, "VENUES LOCATION Verified Listing");
  assert.equal(result.body.property_count, 3);
  assert.deepEqual(client.calls[0].filter, ["email", "owner@example.test"]);
});

test("admin email lookup validates email and reports missing accounts", async () => {
  const invalidClient = mockClient();
  const invalid = await invoke(routeHandler("get", "/admin-preview"), {
    query: { email: "not-an-email" },
    client: invalidClient,
  });
  assert.equal(invalid.status, 400);
  assert.equal(invalidClient.calls.length, 0);

  const missing = await invoke(routeHandler("get", "/admin-preview"), {
    query: { email: "owner@example.test" },
    client: mockClient({ profile: null }),
  });
  assert.equal(missing.status, 404);
});

test("manual plan activation validates inputs before calling the atomic database function", async () => {
  const client = mockClient();
  const invalid = await invoke(routeHandler("post", "/admin-assign"), {
    body: {
      owner_id: "00000000-0000-4000-8000-000000000001",
      plan_code: "free_forever",
      auto_lead_contact: true,
    },
    client,
  });
  assert.equal(invalid.status, 400);
  assert.equal(client.calls.length, 0);

  const result = await invoke(routeHandler("post", "/admin-assign"), {
    body: {
      owner_id: "00000000-0000-4000-8000-000000000001",
      plan_code: "pro_marketing",
      auto_lead_contact: false,
    },
    client,
  });
  assert.deepEqual(client.calls[0], {
    rpc: "admin_assign_subscription",
    args: {
      p_owner_id: "00000000-0000-4000-8000-000000000001",
      p_plan_code: "pro_marketing",
      p_auto_lead_contact: false,
    },
  });
  assert.equal(result.body.subscription.id, "subscription-id");
});

test("manual plan activation explains when the database RPC has not been installed", async () => {
  const result = await invoke(routeHandler("post", "/admin-assign"), {
    body: {
      owner_id: "00000000-0000-4000-8000-000000000001",
      plan_code: "pro_marketing",
      auto_lead_contact: true,
    },
    client: mockClient({
      rpcError: {
        code: "PGRST202",
        message: "Could not find the function public.admin_assign_subscription",
      },
    }),
  });

  assert.equal(result.status, 503);
  assert.match(result.body.error, /supabase\/account_photo_limits\.sql/);
});

test("subscription revocation cancels the account plan without deleting its record", async () => {
  const client = mockClient({
    subscription: {
      id: "subscription-id",
      owner_id: "00000000-0000-4000-8000-000000000001",
      status: "active",
    },
  });
  const result = await invoke(routeHandler("post", "/admin/:ownerId/revoke"), {
    params: { ownerId: "00000000-0000-4000-8000-000000000001" },
    client,
  });
  assert.deepEqual(client.calls[0].update, { status: "cancelled" });
  assert.equal(result.body.subscription.status, "cancelled");
});

test("admin assignment SQL is idempotent and restricted to authenticated admins", async () => {
  for (const filename of ["migration.sql", "account_photo_limits.sql"]) {
    const sql = await readFile(new URL(`../../supabase/${filename}`, import.meta.url), "utf8");
    const assignment = sql.split("create or replace function public.admin_assign_subscription")[1]
      .split("$$;")[0];
    assert.match(assignment, /public\.has_role\(auth\.uid\(\), 'admin'\)/);
    assert.match(assignment, /'verified_listing'/);
    assert.match(assignment, /'pro_marketing'/);
    assert.match(assignment, /on conflict \(owner_id\) do update/);
    assert.match(assignment, /auto_lead_contact = p_auto_lead_contact/);
    assert.match(assignment, /expires_on = excluded\.expires_on/);
    assert.match(sql, /grant execute on function public\.admin_assign_subscription\(uuid, text, boolean\) to authenticated/);
  }
});
