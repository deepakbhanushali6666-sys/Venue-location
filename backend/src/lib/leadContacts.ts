import type { SupabaseClient } from "@supabase/supabase-js";

// leads.mobile / leads.email are revoked at the column level - never select them directly.
export const LEAD_COLUMNS =
  "id, lead_code, property_code, venue_id, venue_name, customer_name, purpose, event_date, budget, guest_count, message, status, created_at, updated_at";

type LeadLike = { id: string } & Record<string, unknown>;

// Resolves masked or full contact details per lead via the lead_contacts() RPC.
export async function withLeadContacts<T extends LeadLike>(
  client: SupabaseClient,
  leads: T[] | null,
): Promise<(T & { mobile: string; email: string; contact_unlocked: boolean })[]> {
  const rows = leads ?? [];
  if (rows.length === 0) return [];

  const { data, error } = await client.rpc("lead_contacts", {
    _lead_ids: rows.map((lead) => lead.id),
  });
  if (error) throw error;

  const contacts = new Map(
    ((data ?? []) as { lead_id: string; mobile: string; email: string; unlocked: boolean }[]).map(
      (row) => [row.lead_id, row],
    ),
  );

  return rows.map((lead) => {
    const contact = contacts.get(lead.id);
    return {
      ...lead,
      mobile: contact?.mobile ?? "",
      email: contact?.email ?? "",
      contact_unlocked: contact?.unlocked ?? false,
    };
  });
}
