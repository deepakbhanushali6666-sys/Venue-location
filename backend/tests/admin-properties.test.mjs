import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { adminRouter } from "../dist/routes/admin.routes.js";

const propertiesRoute = adminRouter.stack
  .find((layer) => layer.route?.path === "/properties")
  .route;
const listProperties = propertiesRoute.stack.at(-1).handle;

async function invoke(req) {
  const result = { status: 200 };
  await listProperties(
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

test("property codes use owner contacts saved on each property", async () => {
  const calls = [];
  const req = {
    client: {
      from(table) {
        const call = { table };
        calls.push(call);
        const query = {
          select(columns) {
            call.columns = columns;
            return this;
          },
          order(column) {
            (call.orders ??= []).push(column);
            return this;
          },
          in(column, values) {
            call.filter = [column, values];
            return this;
          },
          then(resolve, reject) {
            const data =
              table === "venues"
                ? [
                    {
                      id: "venue-1",
                      owner_id: "same-owner",
                      property_code: "001",
                    },
                    {
                      id: "venue-2",
                      owner_id: "same-owner",
                      property_code: "002",
                    },
                    {
                      id: "venue-3",
                      owner_id: "same-owner",
                      property_code: "003",
                    },
                  ]
                : table === "profiles"
                  ? [
                      {
                        id: "same-owner",
                        full_name: "Profile Owner",
                        mobile: "9111111111",
                        email: "profile@example.test",
                      },
                    ]
                  : [
                      {
                        venue_id: "venue-1",
                        contact_name: "Mohit Pandey",
                        contact_mobile: "9000000001",
                        contact_email: "one@example.test",
                      },
                      {
                        venue_id: "venue-2",
                        contact_name: "Mohit Office",
                        contact_mobile: "9000000002",
                        contact_email: "two@example.test",
                      },
                    ];
            return Promise.resolve({ data, error: null }).then(resolve, reject);
          },
        };
        return query;
      },
    },
  };

  const result = await invoke(req);
  assert.equal(result.error, undefined);
  assert.deepEqual(
    result.body.properties.map((property) => [
      property.property_code,
      property.owner_name,
      property.owner_mobile,
      property.owner_email,
    ]),
    [
      ["001", "Mohit Pandey", "9000000001", "one@example.test"],
      ["002", "Mohit Office", "9000000002", "two@example.test"],
      ["003", "Profile Owner", "9111111111", "profile@example.test"],
    ],
  );
  assert.equal(calls[2].table, "venue_owner_contacts");
  assert.match(calls[2].columns, /contact_name/);
});

test("paid listing verification copies per-property owner details from the saved draft", async () => {
  const sql = await readFile(new URL("../../supabase/verified_listing_payment.sql", import.meta.url), "utf8");
  const verification = sql.split("create or replace function public.verify_payment")[1].split("$$;")[0];
  assert.match(sql, /create table if not exists public\.venue_owner_contacts/);
  assert.match(verification, /insert into public\.venue_owner_contacts/);
  assert.match(verification, /v_payload->>'owner_contact_name'/);
  assert.match(verification, /v_payload->>'owner_contact_mobile'/);
  assert.match(verification, /v_payload->>'owner_contact_email'/);
});

test("direct venue creation stores venue and private contacts in one database function", async () => {
  for (const file of ["../../supabase/migration.sql", "../../supabase/verified_listing_payment.sql"]) {
    const sql = await readFile(new URL(file, import.meta.url), "utf8");
    const creationFunction = sql
      .split("create or replace function public.create_venue_with_owner_contact")[1]
      .split("$$;")[0];
    assert.match(creationFunction, /security invoker/i);
    assert.match(creationFunction, /insert into public\.venues/i);
    assert.match(creationFunction, /insert into public\.venue_owner_contacts/i);
  }
});
