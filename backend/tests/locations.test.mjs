import assert from "node:assert/strict";
import { test } from "node:test";
import { locationsRouter } from "../dist/routes/locations.routes.js";
import { supabasePublic } from "../dist/lib/supabasePublic.js";

const list = locationsRouter.stack.find((layer) => layer.route?.methods.get).route.stack.at(-1).handle;

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
    select() { return this; },
    order() { return this; },
    then(resolve) { return Promise.resolve({ data: [...data], error: null }).then(resolve); },
  });
  try {
    let response;
    let error;
    await list({}, { json(body) { response = body; } }, (err) => { error = err; });
    assert.equal(error, undefined);
    assert.deepEqual(response.locations.filter((location) => location.kind === "city").map((location) => location.name),
      ["alibaug", "Mumbai", "Pune", "Thane"]);
    assert.deepEqual(response.locations.filter((location) => location.kind === "state").map((location) => location.name),
      ["Maharashtra", "Gujarat"]);
    assert.equal(response.locations.length, data.length);
  } finally {
    supabasePublic.from = original;
  }
});
