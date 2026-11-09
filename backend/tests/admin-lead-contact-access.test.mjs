import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { adminRouter } from "../dist/routes/admin.routes.js";

function routeHandler(method, path) {
  const route = adminRouter.stack.find(
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

function mockClient({ accounts = [], account = null } = {}) {
  const calls = [];
  return {
    calls,
    async rpc(name, args) {
      calls.push({ rpc: name, args });
      return {
        data: account ? { ...account, auto_lead_contact: args.p_auto_lead_contact } : null,
        error: null,
      };
    },
    from(table) {
      const call = { table };
      calls.push(call);
      const query = {
        select() {
          return this;
        },
        eq(column, value) {
          call.filter = [column, value];
          return this;
        },
        order() {
          return this;
        },
        then(resolve, reject) {
          return Promise.resolve({ data: accounts, error: null }).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

test("lead-contact access list returns enabled user details", async () => {
  const account = {
    id: "00000000-0000-4000-8000-000000000001",
    full_name: "Example Owner",
    email: "owner@example.test",
    mobile: "9876543210",
    auto_lead_contact: true,
  };
  const client = mockClient({ accounts: [account] });
  const result = await invoke(routeHandler("get", "/lead-contact-access"), { client });

  assert.equal(result.error, undefined);
  assert.deepEqual(result.body.accounts, [account]);
  assert.deepEqual(client.calls[0].filter, ["auto_lead_contact", true]);
});

test("lead-contact access changes require a valid account ID and boolean", async () => {
  const client = mockClient();
  const invalid = await invoke(routeHandler("patch", "/lead-contact-access/:userId"), {
    params: { userId: "not-a-uuid" },
    body: { auto_lead_contact: true },
    client,
  });
  assert.equal(invalid.status, 400);
  assert.equal(client.calls.length, 0);

  const invalidFlag = await invoke(routeHandler("patch", "/lead-contact-access/:userId"), {
    params: { userId: "00000000-0000-4000-8000-000000000001" },
    body: { auto_lead_contact: "true" },
    client,
  });
  assert.equal(invalidFlag.status, 400);
  assert.equal(client.calls.length, 0);
});

test("lead-contact access can be enabled or revoked without changing the subscription", async () => {
  const account = {
    id: "00000000-0000-4000-8000-000000000001",
    full_name: "Example Owner",
    email: "owner@example.test",
    mobile: "9876543210",
    auto_lead_contact: false,
  };
  const client = mockClient({ account });
  const result = await invoke(routeHandler("patch", "/lead-contact-access/:userId"), {
    params: { userId: account.id },
    body: { auto_lead_contact: true },
    client,
  });

  assert.equal(result.error, undefined);
  assert.deepEqual(client.calls[0], {
    rpc: "admin_set_lead_contact_access",
    args: {
      p_owner_id: account.id,
      p_auto_lead_contact: true,
    },
  });
  assert.equal(result.body.account.auto_lead_contact, true);
});

test("lead-contact access SQL is admin-only and executable by authenticated users", async () => {
  for (const filename of ["migration.sql", "account_photo_limits.sql"]) {
    const sql = await readFile(new URL(`../../supabase/${filename}`, import.meta.url), "utf8");
    const assignment = sql.split("create or replace function public.admin_set_lead_contact_access")[1]
      .split("$$;")[0];
    assert.match(assignment, /public\.has_role\(auth\.uid\(\), 'admin'\)/);
    assert.match(assignment, /auto_lead_contact = p_auto_lead_contact/);
    assert.match(
      sql,
      /grant execute on function public\.admin_set_lead_contact_access\(uuid, boolean\) to authenticated/,
    );
  }
});
