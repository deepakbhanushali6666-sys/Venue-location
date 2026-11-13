import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { subscriptionPhotoLimit } from "../dist/lib/subscriptions.js";
import { venuesRouter } from "../dist/routes/venues.routes.js";
import { venueDraftsRouter } from "../dist/routes/venue-drafts.routes.js";
import { subscriptionsRouter } from "../dist/routes/subscriptions.routes.js";
import { paymentsRouter } from "../dist/routes/payments.routes.js";

function handler(router, method, path) {
  return router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]).route.stack.at(-1).handle;
}

async function invoke(route, req) {
  const result = { status: 200 };
  await route(req, {
    status(code) { result.status = code; return this; },
    json(body) { result.body = body; },
  }, (error) => { result.error = error; });
  return result;
}

function request(subscription, body, existingPhotos = []) {
  const writes = [];
  const req = {
    user: { id: "owner", isAdmin: false },
    body,
    params: { id: "property" },
    client: {
      from(table) {
        let written;
        const query = {
          select() { return this; },
          eq() { return this; },
          insert(payload) { written = payload; writes.push({ table, payload }); return this; },
          update(payload) { written = payload; writes.push({ table, payload }); return this; },
          async maybeSingle() {
            return { data: table === "subscriptions" ? subscription : { owner_id: "owner", photos: existingPhotos }, error: null };
          },
          async single() { return { data: { id: "created", ...written }, error: null }; },
        };
        return query;
      },
      rpc(name, args) {
        writes.push({ table: "venues", name, args, payload: args.p_venue });
        return {
          async single() {
            return { data: { id: "created", ...args.p_venue }, error: null };
          },
        };
      },
    },
  };
  return { req, writes };
}

const active = (amount) => ({ status: "active", amount, expires_on: "2099-12-31" });
const photos = (count) => Array.from({ length: count }, (_, i) => `photo-${i}`);

test("account allowance depends on verified tier, status, and inclusive expiry", () => {
  const today = "2026-10-09";
  assert.equal(subscriptionPhotoLimit(null, today), 10);
  for (const [amount, expected] of [[3650, 20], [36500, 60]]) {
    assert.equal(subscriptionPhotoLimit(active(amount), today), expected);
    assert.equal(subscriptionPhotoLimit({ ...active(amount), expires_on: today }, today), expected);
    assert.equal(subscriptionPhotoLimit({ ...active(amount), expires_on: null }, today), expected);
    assert.equal(subscriptionPhotoLimit({ ...active(amount), expires_on: "2026-10-08" }, today), 10);
    for (const status of ["inactive", "expired", "cancelled", "pending"]) {
      assert.equal(subscriptionPhotoLimit({ ...active(amount), status }, today), 10);
    }
  }
  assert.equal(subscriptionPhotoLimit(active(1), today), 10);
});

test("each property gets the full account allowance; creation rejects limit + 1", async () => {
  for (const [subscription, limit] of [[null, 10], [active(3650), 20], [active(36500), 60]]) {
    for (let property = 0; property < 2; property++) {
      const { req, writes } = request(subscription, { name: `Property ${property}`, photos: photos(limit) });
      const result = await invoke(handler(venuesRouter, "post", "/"), req);
      assert.equal(result.status, 201);
      assert.equal(writes[0].payload.photos.length, limit);
    }
    const { req, writes } = request(subscription, { photos: photos(limit + 1) });
    const result = await invoke(handler(venuesRouter, "post", "/"), req);
    assert.equal(result.status, 400);
    assert.match(result.body.error, new RegExp(`${limit} photos`));
    assert.equal(writes.length, 0);
  }
});

test("existing free properties gain the upgraded allowance without recreation", async () => {
  for (const [amount, limit] of [[3650, 20], [36500, 60]]) {
    const { req, writes } = request(active(amount), { photos: photos(limit) }, photos(10));
    const result = await invoke(handler(venuesRouter, "patch", "/:id"), req);
    assert.equal(result.status, 200);
    assert.deepEqual(writes[0].payload.photos.slice(0, 10), photos(10));
    const over = request(active(amount), { photos: photos(limit + 1) }, photos(10));
    assert.equal((await invoke(handler(venuesRouter, "patch", "/:id"), over.req)).status, 400);
    assert.equal(over.writes.length, 0);
  }
});

test("expiry preserves photos and editing but prevents increasing over the free limit", async () => {
  const route = handler(venuesRouter, "patch", "/:id");
  for (const count of [60, 59]) {
    const { req } = request(null, { photos: photos(count), name: "Edited property" }, photos(60));
    assert.equal((await invoke(route, req)).status, 200);
  }
  const { req, writes } = request(null, { photos: photos(61) }, photos(60));
  assert.equal((await invoke(route, req)).status, 400);
  assert.equal(writes.length, 0);
});

test("paid drafts use 20 and 60 photo thresholds", async () => {
  for (const [plan_code, limit] of [["verified_listing", 20], ["pro_marketing", 60]]) {
    for (const count of [limit, limit + 1]) {
      const { req, writes } = request(null, {
        payload: { name: "Venue", slug: "venue", city: "Mumbai", category: "resorts", plan_code, photos: photos(count) },
      });
      const result = await invoke(handler(venueDraftsRouter, "post", "/"), req);
      assert.equal(result.status, count === limit ? 201 : 400);
      assert.equal(writes.length, count === limit ? 1 : 0);
    }
  }
});

test("subscription API returns authoritative account photo allowance", async () => {
  for (const amount of [3650, 36500]) {
    const { req } = request(active(amount), {});
    const result = await invoke(handler(subscriptionsRouter, "get", "/mine"), req);
    assert.equal(result.body.subscription.photo_limit, amount === 36500 ? 60 : 20);
  }
});

test("account upgrade payment adds GST to the server plan price, not the client price", async () => {
  const invoiceDetails = {
    invoice_to_name: "Example Venue Pvt Ltd",
    invoice_to_address: "10 Market Road, Mumbai",
    invoice_to_state: "Maharashtra",
    invoice_to_gstin: "27ABCDE1234F1Z5",
  };
  for (const [plan_code, amount] of [["verified_listing", 4307], ["pro_marketing", 43070]]) {
    const { req, writes } = request(null, {
      plan_code, amount: 1, reference: "UTR123", ...invoiceDetails,
    });
    const result = await invoke(handler(paymentsRouter, "post", "/"), req);
    assert.equal(result.status, 201);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].table, "payments");
    assert.equal(writes[0].payload.amount, amount);
    assert.equal(writes[0].payload.status, "pending");
    assert.equal(writes[0].payload.owner_id, "owner");
    assert.equal(writes[0].payload.invoice_to_name, invoiceDetails.invoice_to_name);
    assert.equal(writes[0].payload.invoice_to_gstin, invoiceDetails.invoice_to_gstin);
  }
});

test("payment verification accepts legacy inclusive payments and stores the pre-tax plan value", async () => {
  for (const filename of ["migration.sql", "verified_listing_payment.sql"]) {
    const sql = await readFile(new URL(`../../supabase/${filename}`, import.meta.url), "utf8");
    const verification = sql.split("create or replace function public.verify_payment")[1].split("$$;")[0];
    assert.match(verification, /v_pay\.legacy_gst_inclusive/);
    assert.match(verification, /round\(v_plan_amount \* 1\.18\)::integer/);
    assert.match(verification, /insert into public\.subscriptions[\s\S]*v_plan_amount/);
    assert.match(sql, /legacy_gst_inclusive = false/);
    if (filename === "verified_listing_payment.sql") {
      assert.match(verification, /v_current_amount > v_plan_amount/);
      assert.match(
        verification,
        /values \(v_pay\.owner_id, v_plan_name, 'active', v_plan_amount, v_start, v_expiry, v_invoice\)/,
      );
    }
  }
});

test("venue submission stores owner contact details separately from public venue data", async () => {
  const writes = [];
  const req = {
    user: { id: "owner", isAdmin: false },
    body: {
      name: "Example Venue",
      slug: "example-venue",
      category: "resorts",
      city: "Mumbai",
      owner_contact_name: "Mohit Pandey",
      owner_contact_mobile: "9000000001",
      owner_contact_email: "mohit@example.test",
      photos: [],
    },
    client: {
      from(table) {
        const query = {
          select() { return this; },
          eq() { return this; },
          async maybeSingle() { return { data: null, error: null }; },
        };
        return query;
      },
      rpc(name, args) {
        writes.push({ name, args });
        return {
          async single() {
            return { data: { id: "venue-id", ...args.p_venue }, error: null };
          },
        };
      },
    },
  };
  const result = await invoke(handler(venuesRouter, "post", "/"), req);
  assert.equal(result.status, 201);
  assert.equal(writes[0].name, "create_venue_with_owner_contact");
  assert.equal(writes[0].args.p_venue.owner_contact_name, undefined);
  assert.deepEqual(writes[0].args, {
    p_venue: {
      name: "Example Venue",
      slug: "example-venue",
      category: "resorts",
      city: "Mumbai",
      photos: [],
      owner_id: "owner",
      status: "pending",
      description: "",
      gst_number: "",
      amenities: [],
      suitable_for: [],
      booking_purposes: [],
      booking_restrictions: [],
      subcategory: [],
      film_subcategory: [],
    },
    p_contact_name: "Mohit Pandey",
    p_contact_mobile: "9000000001",
    p_contact_email: "mohit@example.test",
  });
});

test("subscription payments require billing details and reject malformed GSTINs", async () => {
  const valid = {
    plan_code: "verified_listing",
    reference: "UTR123",
    invoice_to_name: "Example Venue",
    invoice_to_address: "10 Market Road",
    invoice_to_state: "Maharashtra",
  };
  for (const body of [
    { ...valid, invoice_to_name: "" },
    { ...valid, invoice_to_address: "" },
    { ...valid, invoice_to_state: "" },
    { ...valid, invoice_to_gstin: "not-a-gstin" },
  ]) {
    const { req, writes } = request(null, body);
    const result = await invoke(handler(paymentsRouter, "post", "/"), req);
    assert.equal(result.status, 400);
    assert.equal(writes.length, 0);
  }
});

test("subscription lookup failures do not silently grant a free or paid allowance", async () => {
  const { req } = request(null, { photos: photos(10) });
  const failure = new Error("Subscription lookup failed");
  req.client.from = () => ({
    select() { return this; },
    eq() { return this; },
    async maybeSingle() { return { data: null, error: failure }; },
  });
  const result = await invoke(handler(venuesRouter, "post", "/"), req);
  assert.equal(result.error, failure);
});

test("unsupported account plans cannot create a payment", async () => {
  for (const plan_code of ["unknown", "toString", "__proto__"]) {
    const { req, writes } = request(null, { plan_code, reference: "UTR123" });
    const result = await invoke(handler(paymentsRouter, "post", "/"), req);
    assert.equal(result.status, 400);
    assert.equal(writes.length, 0);
  }
});
