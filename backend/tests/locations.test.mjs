import assert from "node:assert/strict";
import { test } from "node:test";
import { locationsRouter } from "../dist/routes/locations.routes.js";
import { supabasePublic } from "../dist/lib/supabasePublic.js";

const list = locationsRouter.stack
  .find((layer) => layer.route?.methods.get)
  .route.stack.at(-1).handle;

test("city lists sort alphabetically regardless of insertion order, preserving state order", async () => {
  const original = supabasePublic.from;
  const data = [
    { kind: "city", name: "Mumbai", sort_order: 1 },
    { kind: "city", name: "Thane", sort_order: 2 },
    { kind: "city", name: "alibaug", sort_order: 99 },
    { kind: "city", name: "Pune", sort_order: 100 },
    { kind: "state", name: "Maharashtra", sort_order: 1 },
    { kind: "state", name: "Gujarat", sort_order: 2 },
  ];
  supabasePublic.from = () => ({
    select() {
      return this;
    },
    order() {
      return this;
    },
    then(resolve) {
      return Promise.resolve({ data: [...data], error: null }).then(resolve);
    },
  });

  try {
    let response;
    let error;
    await list(
      {},
      {
        json(body) {
          response = body;
        },
      },
      (err) => {
        error = err;
      },
    );
    assert.equal(error, undefined);
    assert.deepEqual(
      response.locations
        .filter((location) => location.kind === "city")
        .map((location) => location.name),
      ["alibaug", "Mumbai", "Pune", "Thane"],
    );
    assert.deepEqual(
      response.locations
        .filter((location) => location.kind === "state")
        .map((location) => location.name),
      ["Maharashtra", "Gujarat"],
    );
    assert.equal(response.locations.length, data.length);
  } finally {
    supabasePublic.from = original;
  }
});

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

const create = locationsRouter.stack
  .find((layer) => layer.route?.methods.post)
  .route.stack.at(-1).handle;
const assign = locationsRouter.stack
  .find((layer) => layer.route?.methods.patch)
  .route.stack.at(-1).handle;

test("adding a city requires a state and saves its link", async () => {
  const missing = await invoke(create, { body: { kind: "city", name: "Ranchi" } });
  assert.equal(missing.status, 400);
  let saved;
  const result = await invoke(create, {
    body: { kind: "city", name: " Ranchi ", state_id: "jharkhand" },
    client: {
      from() {
        return {
          insert(payload) {
            saved = payload;
            return this;
          },
          select() {
            return this;
          },
          async single() {
            return { data: saved, error: null };
          },
        };
      },
    },
  });
  assert.equal(result.status, 201);
  assert.equal(saved.state_id, "jharkhand");
  assert.equal(saved.name, "Ranchi");
});

test("existing cities can be assigned; missing state and absent city return errors", async () => {
  assert.equal((await invoke(assign, { body: {}, params: { id: "city" } })).status, 400);
  let updated;
  const client = {
    from() {
      return {
        update(payload) {
          updated = payload;
          return this;
        },
        eq() {
          return this;
        },
        select() {
          return this;
        },
        async maybeSingle() {
          return { data: { id: "city", ...updated }, error: null };
        },
      };
    },
  };
  const result = await invoke(assign, {
    body: { state_id: "jharkhand" },
    params: { id: "city" },
    client,
  });
  assert.equal(result.body.location.state_id, "jharkhand");
  const missingClient = {
    from() {
      return {
        update() {
          return this;
        },
        eq() {
          return this;
        },
        select() {
          return this;
        },
        async maybeSingle() {
          return { data: null, error: null };
        },
      };
    },
  };
  assert.equal(
    (
      await invoke(assign, {
        body: { state_id: "state" },
        params: { id: "missing" },
        client: missingClient,
      })
    ).status,
    404,
  );
});

test("a state cannot be deleted while it still has linked cities", async () => {
  const remove = locationsRouter.stack
    .find((layer) => layer.route?.methods.delete)
    .route.stack.at(-1).handle;
  const result = await invoke(remove, {
    params: { id: "state" },
    client: {
      from() {
        return {
          delete() {
            return this;
          },
          async eq() {
            return { error: { code: "23503" } };
          },
        };
      },
    },
  });
  assert.equal(result.status, 409);
  assert.match(result.body.error, /Move or delete/);
});
