import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { subscriptionsRouter } from "../dist/routes/subscriptions.routes.js";
import { paymentsRouter } from "../dist/routes/payments.routes.js";

const ownersRoute = subscriptionsRouter.stack.find((layer) => layer.route?.path === "/owners").route;
const owners = ownersRoute.stack.at(-1).handle;
const verify = paymentsRouter.stack.find((layer) => layer.route?.path === "/:id/verify").route.stack.at(-1).handle;

async function invoke(handler, req) {
  const result = { status: 200 };
  await handler(req, {
    status(code) { result.status = code; return this; },
    json(body) { result.body = body; },
  }, (error) => { result.error = error; });
  return result;
}

function clientMock({ subscriptions = [], profiles = [], counts = {}, total = subscriptions.length, failureTable } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const call = { table };
      calls.push(call);
      const query = {
        select(columns, options) { call.columns = columns; call.options = options; return this; },
        order(column, options) { (call.orders ??= []).push([column, options]); return this; },
        range(from, to) { call.range = [from, to]; return this; },
        in(column, values) { call.filter = [column, values]; return this; },
        eq(column, value) { call.filter = [column, value]; return this; },
        then(resolve, reject) {
          const result = table === failureTable ? { error: new Error(`${table} failed`), data: null, count: null }
            : table === "subscriptions" ? { data: subscriptions, count: total, error: null }
            : table === "profiles" ? { data: profiles, error: null }
            : { data: null, count: counts[call.filter?.[1]] ?? 0, error: null };
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

const subscription = (id, amount = 3650) => ({
  id: `sub-${id}`, owner_id: id, plan_name: amount === 36500 ? "Pro Marketing" : "Verified Listing",
  amount, status: "active", started_on: "2026-10-09", expires_on: "2099-10-09",
  invoice_number: `OMS/INV/2026/${id}`,
});

test("admin subscriptions join owner contacts and exact counts, including zero properties", async () => {
  const client = clientMock({
    subscriptions: [subscription("one"), subscription("two", 36500)],
    profiles: [{ id: "one", full_name: "Test Owner", mobile: "9876543210", email: "owner@example.test" }],
    counts: { one: 1501, two: 0 },
    total: 65,
  });
  const result = await invoke(owners, { query: { page: "1" }, client });
  assert.equal(result.status, 200);
  assert.equal(result.error, undefined);
  assert.equal(result.body.total, 65);
  assert.equal(result.body.pageSize, 50);
  assert.deepEqual(client.calls[0].range, [50, 99]);
  assert.ok(client.calls[0].columns.split(", ").includes("invoice_number"));
  assert.equal(result.body.subscriptions[0].invoice_number, "OMS/INV/2026/one");
  assert.deepEqual(result.body.subscriptions[0], {
    ...subscription("one"), owner_name: "Test Owner", owner_mobile: "9876543210",
    owner_email: "owner@example.test", property_count: 1501, photo_limit: 20,
  });
  assert.equal(result.body.subscriptions[1].property_count, 0);
  assert.equal(result.body.subscriptions[1].owner_name, null);
  assert.equal(result.body.subscriptions[1].photo_limit, 60);
  for (const call of client.calls.filter((call) => call.table === "venues")) {
    assert.deepEqual(call.options, { count: "exact", head: true });
    assert.equal(call.filter[0], "owner_id");
  }
});

test("expired subscriptions remain visible with their purchased plan and free photo allowance", async () => {
  const row = { ...subscription("one", 36500), expires_on: "2000-01-01" };
  const result = await invoke(owners, { query: {}, client: clientMock({ subscriptions: [row] }) });
  assert.equal(result.body.subscriptions[0].status, "expired");
  assert.equal(result.body.subscriptions[0].amount, 36500);
  assert.equal(result.body.subscriptions[0].photo_limit, 10);
});

test("empty subscriptions return a shaped response without owner or venue queries", async () => {
  const client = clientMock();
  const result = await invoke(owners, { query: {}, client });
  assert.deepEqual(result.body, { subscriptions: [], total: 0, pageSize: 50 });
  assert.equal(client.calls.length, 1);
});

test("invalid pagination is rejected before database access", async () => {
  for (const page of ["-1", "0.5", "no", "100001"]) {
    const client = clientMock();
    const result = await invoke(owners, { query: { page }, client });
    assert.equal(result.status, 400);
    assert.equal(client.calls.length, 0);
  }
});

test("subscription, profile, and count failures surface explicitly", async () => {
  for (const failureTable of ["subscriptions", "profiles", "venues"]) {
    const result = await invoke(owners, {
      query: {}, client: clientMock({ subscriptions: [subscription("one")], failureTable }),
    });
    assert.equal(result.error?.message, `${failureTable} failed`);
    assert.equal(result.body, undefined);
  }
});

test("subscription contacts are admin-only, not available to owners or team members", async () => {
  const guard = ownersRoute.stack[1].handle;
  for (const user of [{ isAdmin: false }, { isAdmin: false, isTeam: true }]) {
    const result = await invoke(guard, { user });
    assert.equal(result.status, 403);
  }
});

test("payment verification returns success without generating a downloadable document", async () => {
  const calls = [];
  const result = await invoke(verify, {
    params: { id: "payment" },
    client: { async rpc(name, payload) { calls.push([name, payload]); return { data: "OMS/INV/2026/1", error: null }; } },
  });
  assert.deepEqual(calls, [["verify_payment", { p_payment_id: "payment" }]]);
  assert.deepEqual(result.body, { success: true });
});

test("verification SQL issues a number once and saves it on payment and subscription", async () => {
  for (const filename of ["migration.sql", "verified_listing_payment.sql"]) {
    const sql = await readFile(new URL(`../../supabase/${filename}`, import.meta.url), "utf8");
    const verification = sql.split("create or replace function public.verify_payment")[1].split("$$;")[0];
    assert.match(verification, /if v_pay\.status = 'verified' then return v_pay\.invoice_number; end if;/);
    assert.equal((verification.match(/nextval\('public\.invoice_seq'\)/g) ?? []).length, 1);
    assert.match(verification, /invoice_number = excluded\.invoice_number/);
    assert.match(verification, /invoice_number = v_invoice/);
    assert.match(verification, /return v_invoice;/);
  }
});

test("dashboard shows invoice numbers as text without invoice download links", async () => {
  const panel = await readFile(new URL("../../frontend/src/components/site/SubscriptionPanel.tsx", import.meta.url), "utf8");
  assert.match(panel, /Latest invoice number/);
  assert.match(panel, /p\.invoice_number \|\| "Not issued"/);
  assert.match(panel, /Invoice downloads are not available yet/);
  assert.doesNotMatch(panel, /to="\/invoice|window\.print|download=/);
});

test("admin subscriptions display the latest invoice number without download links", async () => {
  const page = await readFile(new URL("../../frontend/src/routes/_authenticated/subscriptions.tsx", import.meta.url), "utf8");
  assert.match(page, /Latest Invoice Number/);
  assert.match(page, /subscription\.invoice_number \|\| "Not issued"/);
  assert.match(page, /colSpan=\{11\}/);
  assert.doesNotMatch(page, /to="\/invoice|window\.print|download=/);
});
