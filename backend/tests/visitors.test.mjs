import assert from "node:assert/strict";
import { test } from "node:test";
import { visitorsRouter } from "../dist/routes/visitors.routes.js";
import { supabasePublic } from "../dist/lib/supabasePublic.js";

const postRoute = visitorsRouter.stack.find((layer) => layer.route?.methods.post).route;
const getRoute = visitorsRouter.stack.find(
  (layer) => layer.route?.methods.get && layer.route.path === "/",
).route;
const submit = postRoute.stack.at(-1).handle;
const list = getRoute.stack.at(-1).handle;
const payload = {
  id: "01234567-89ab-4cde-8fab-0123456789ab",
  visitor_name: "Test Visitor",
  mobile: "9876543210",
  search_type: "film",
  property_slug: null,
  requirements: { category: "resorts", city: "Mumbai", date: "2026-11-01", capacity: "50-100" },
};

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

test("visitor submissions validate before database access and preserve requirements", async () => {
  const originalRpc = supabasePublic.rpc;
  const calls = [];
  supabasePublic.rpc = async (name, body) => {
    calls.push({ name, body });
    return { error: null };
  };
  try {
    for (const body of [
      null,
      { ...payload, visitor_name: " " },
      { ...payload, mobile: "--------" },
      { ...payload, search_type: "unknown" },
      { ...payload, id: "invalid" },
      { ...payload, requirements: [] },
      { ...payload, requirements: { city: 1 } },
      { ...payload, requirements: { secret: "not allowed" } },
    ]) {
      assert.equal((await invoke(submit, { body })).status, 400);
    }
    assert.equal(calls.length, 0);
    const result = await invoke(submit, { body: payload });
    assert.equal(result.status, 201);
    assert.deepEqual(result.body, { recorded: true });
    assert.equal(calls[0].name, "record_visitor_search");
    assert.deepEqual(calls[0].body.p_requirements, payload.requirements);
    assert.equal(calls[0].body.p_mobile, payload.mobile);

    const failure = new Error("Database unavailable");
    supabasePublic.rpc = async () => ({ error: failure });
    assert.equal((await invoke(submit, { body: payload })).error, failure);
  } finally {
    supabasePublic.rpc = originalRpc;
  }
});

test("visitor listing remains authenticated/admin-only and paginates", async () => {
  assert.equal(getRoute.stack[0].handle.name, "requireAuth");
  assert.equal(getRoute.stack[1].handle.name, "requireAdmin");
  assert.equal((await invoke(getRoute.stack[0].handle, { headers: {} })).status, 401);
  assert.equal((await invoke(getRoute.stack[1].handle, { user: { isAdmin: false } })).status, 403);
  assert.equal((await invoke(list, { query: { page: "-1" } })).status, 400);
  assert.equal((await invoke(list, { query: { page: "NaN" } })).status, 400);
  let range;
  const result = await invoke(list, {
    query: { page: "1" },
    client: {
      from(table) {
        assert.equal(table, "visitor_searches");
        return {
          select(_columns, options) {
            assert.deepEqual(options, { count: "exact" });
            return {
              order() {
                return {
                  order() {
                    return {
                      async range(start, end) {
                        range = [start, end];
                        return { data: [payload], error: null, count: 51 };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    },
  });

  assert.deepEqual(range, [50, 99]);
  assert.deepEqual(result.body, { visitors: [payload], total: 51 });
});

test("visitor filters validate dates, search and type before database access", async () => {
  for (const query of [
    { search: "abc,evil" },
    { search: "---" },
    { search: ["name"] },
    { search: "a".repeat(81) },
    { type: "unknown" },
    { from: "2026-02-30" },
    { from: "2026-10-12", to: "2026-10-11" },
    { mobile: "bad" },
  ]) {
    assert.equal((await invoke(list, { query })).status, 400, JSON.stringify(query));
  }
  const calls = [];
  const builder = {
    select() {
      return this;
    },
    or(value) {
      calls.push(["or", value]);
      return this;
    },
    eq(...args) {
      calls.push(["eq", ...args]);
      return this;
    },
    gte(...args) {
      calls.push(["gte", ...args]);
      return this;
    },
    lt(...args) {
      calls.push(["lt", ...args]);
      return this;
    },
    order() {
      return this;
    },
    async range(...args) {
      calls.push(["range", ...args]);
      return { data: [], count: 0, error: null };
    },
  };
  const result = await invoke(list, {
    query: {
      search: "98765 43210",
      type: "property",
      mobile: "9876543210",
      from: "2026-10-01",
      to: "2026-10-11",
      page: "2",
    },
    client: {
      from() {
        return builder;
      },
    },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(calls, [
    ["or", "visitor_name.ilike.%98765 43210%,mobile_key.ilike.%9876543210%"],
    ["eq", "search_type", "property"],
    ["eq", "mobile_key", "9876543210"],
    ["gte", "created_at", "2026-10-01T00:00:00.000Z"],
    ["lt", "created_at", "2026-10-12T00:00:00.000Z"],
    ["range", 100, 149],
  ]);
});

test("summary is admin-only, passes all filters and surfaces database failures", async () => {
  const route = visitorsRouter.stack.find((layer) => layer.route?.path === "/summary").route;
  assert.equal(route.stack[0].handle.name, "requireAuth");
  assert.equal(route.stack[1].handle.name, "requireAdmin");
  assert.equal((await invoke(route.stack[1].handle, { user: { isAdmin: false } })).status, 403);
  const handler = route.stack.at(-1).handle;
  assert.equal((await invoke(handler, { query: { to: "not-a-date" } })).status, 400);
  const expected = { visitors: [], total: 0, activityTotal: 0 };
  const result = await invoke(handler, {
    query: { page: "1", search: "Jane", type: "venue" },
    client: {
      async rpc(name, params) {
        assert.equal(name, "visitor_activity_summary");
        assert.deepEqual(params, {
          p_page: 1,
          p_search: "Jane",
          p_type: "venue",
          p_mobile: "",
          p_from: null,
          p_to: null,
        });
        return { data: expected, error: null };
      },
    },
  });
  assert.deepEqual(result.body, expected);
  const error = new Error("Summary unavailable");
  assert.equal(
    (
      await invoke(handler, {
        query: {},
        client: {
          async rpc() {
            return { error };
          },
        },
      })
    ).error,
    error,
  );
});
