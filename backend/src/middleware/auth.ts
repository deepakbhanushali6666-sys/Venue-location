import type { NextFunction, Request, Response } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseUserClient } from "../lib/supabaseUserClient.js";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string | null; isAdmin: boolean };
  token?: string;
  // Client scoped to the caller's own JWT - Postgres RLS enforces authorization on every query.
  client?: SupabaseClient;
}

function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
}

async function resolveUser(token: string) {
  const client = createSupabaseUserClient(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: role } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  return { client, user: { id: data.user.id, email: data.user.email ?? null, isAdmin: Boolean(role) } };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const resolved = await resolveUser(token);
  if (!resolved) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  req.token = token;
  req.client = resolved.client;
  req.user = resolved.user;
  next();
}

// Resolves the caller if a valid token is present, but never rejects the request.
export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  const resolved = await resolveUser(token);
  if (resolved) {
    req.token = token;
    req.client = resolved.client;
    req.user = resolved.user;
  }
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
