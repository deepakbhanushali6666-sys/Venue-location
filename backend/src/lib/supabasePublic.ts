import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// Anonymous client (no user JWT). Relies on RLS "anon" policies -
// public venue listings, approved reviews, and anonymous lead submission.
export const supabasePublic = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
