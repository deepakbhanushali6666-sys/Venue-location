import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// Per-request client scoped to the caller's own JWT, so Postgres `auth.uid()` and
// RLS/SECURITY DEFINER checks (e.g. verify_payment, reject_payment) run as that user.
export function createSupabaseUserClient(accessToken: string) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
