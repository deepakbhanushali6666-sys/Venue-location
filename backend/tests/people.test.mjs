import assert from "node:assert/strict";
import { test } from "node:test";
import { peopleRouter } from "../dist/routes/people.routes.js";
import { supabasePublic } from "../dist/lib/supabasePublic.js";

async function invoke(handler, req) {
  const result = { status: 200 };
  await handler(req, {
    status(code) { result.status = code; return this; },
    json(body) { result.body = body; },
  }, (error) => { result.error = error; });
  return result;
}

test("public profiles request section, rank, then name ordering", async () => {
  const original = supabasePublic.from;
  const orders = [];
  supabasePublic.from = () => ({
    select() { return this; },
    order(key) { orders.push(key); return this; },
    then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
  });
  try {
    const handler = peopleRouter.stack.find((layer) => layer.route?.methods.get).route.stack.at(-1).handle;
    const result = await invoke(handler, {});
    assert.deepEqual(orders, ["section", "sort_order", "name"]);
    assert.deepEqual(result.body, { profiles: [] });
    assert.equal(result.error, undefined);
  } finally { supabasePublic.from = original; }
});

test("admin profile creation and updates persist ranks and reject invalid orders", async () => {
  for (const method of ["post", "patch"]) {
    const route = peopleRouter.stack.find((layer) => layer.route?.methods[method]).route;
    assert.equal(route.stack[0].handle.name, "requireAuth");
    assert.equal(route.stack[1].handle.name, "requireAdmin");
    const handler = route.stack.at(-1).handle;
    for (const sort_order of [-1, 0.5, "1", null, 2147483647]) {
      const result = await invoke(handler, { body: { section: "team", name: "Member", sort_order } });
      assert.equal(result.status, 400);
    }
    let saved;
    const builder = {
      insert(payload) { saved = payload; return this; },
      update(payload) { saved = payload; return this; },
      eq() { return this; }, select() { return this; },
      async single() { return { data: saved, error: null }; },
    };
    for (const sort_order of [0, 1, 2]) {
      const result = await invoke(handler, {
        body: { section: "team", name: "Member", sort_order },
        params: { id: "member" }, client: { from() { return builder; } },
      });
      assert.equal(result.body.profile.sort_order, sort_order);
      assert.equal(result.error, undefined);
    }
  }
});
