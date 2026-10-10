import assert from "node:assert/strict";
import { test } from "node:test";
import { categoriesRouter } from "../dist/routes/categories.routes.js";
import { supabasePublic } from "../dist/lib/supabasePublic.js";

const list = categoriesRouter.stack.find((layer) => layer.route?.methods.get).route.stack.at(-1).handle;

test("venue and film categories sort A-Z without changing subcategory associations or order", async () => {
  const original = supabasePublic.from;
  const rows = [
    { id: "studio", name: "Studios", kind: "film", sort_order: 0 },
    { id: "hotel", name: "Hotels", kind: "venue", sort_order: 0 },
    { id: "farm", name: "farmhouses", kind: "venue", sort_order: 99 },
    { id: "air", name: "Airports", kind: "film", sort_order: 99 },
  ];
  const subcategories = [
    { id: "large", category_id: "studio", name: "Large Studio", sort_order: 0 },
    { id: "chroma", category_id: "studio", name: "Chroma", sort_order: 1 },
    { id: "pool", category_id: "hotel", name: "Pool", sort_order: 0 },
  ];
  supabasePublic.from = (table) => ({
    kind: null,
    select() { return this; },
    eq(_column, kind) { this.kind = kind; return this; },
    order() { return this; },
    then(resolve) {
      const data = table === "venue_categories" ? rows.filter((row) => row.kind === this.kind) : subcategories;
      return Promise.resolve({ data, error: null }).then(resolve);
    },
  });
  try {
    for (const kind of ["venue", "film"]) {
      let response;
      let error;
      await list({ query: { kind } }, { json(body) { response = body; } }, (err) => { error = err; });
      assert.equal(error, undefined);
      assert.deepEqual(response.categories.map((category) => category.name),
        kind === "film" ? ["Airports", "Studios"] : ["farmhouses", "Hotels"]);
      for (const category of response.categories) {
        assert.deepEqual(category.subcategories, subcategories.filter((row) => row.category_id === category.id));
      }
    }
  } finally {
    supabasePublic.from = original;
  }
});
