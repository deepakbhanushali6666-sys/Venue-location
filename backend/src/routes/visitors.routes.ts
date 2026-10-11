import { Router } from "express";
import { supabasePublic } from "../lib/supabasePublic.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const visitorsRouter = Router();

const requirementKeys = new Set([
  "category", "subcategory", "filmType", "filmSubcategory", "city", "state",
  "event", "date", "budget", "capacity", "purpose",
]);

visitorsRouter.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object") {
      res.status(400).json({ error: "Visitor details are required" });
      return;
    }
    const { id, visitor_name, mobile, search_type, property_slug, requirements } = body;
    if (
      typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      typeof visitor_name !== "string" || visitor_name.trim().length < 2 || visitor_name.trim().length > 80 ||
      typeof mobile !== "string" || !/^[0-9+ -]{8,15}$/.test(mobile.trim()) ||
      mobile.replace(/\D/g, "").length < 8 ||
      !["venue", "film", "all", "property"].includes(search_type) ||
      (property_slug !== undefined && property_slug !== null && (typeof property_slug !== "string" || property_slug.length > 200)) ||
      !requirements || typeof requirements !== "object" || Array.isArray(requirements) ||
      Object.entries(requirements).some(([key, value]) => !requirementKeys.has(key) || typeof value !== "string" || value.length > 200)
    ) {
      res.status(400).json({ error: "Enter a valid name, phone number and search requirements" });
      return;
    }
    const { error } = await supabasePublic.rpc("record_visitor_search", {
      p_id: id,
      p_visitor_name: visitor_name.trim(),
      p_mobile: mobile.trim(),
      p_search_type: search_type,
      p_property_slug: property_slug ?? null,
      p_requirements: requirements,
    });
    if (error) throw error;
    res.status(201).json({ recorded: true });
  } catch (error) {
    next(error);
  }
});

function visitorFilters(query: AuthedRequest["query"]) {
  const page = query["page"] === undefined ? 0 : Number(query["page"]);
  if (!Number.isSafeInteger(page) || page < 0 || page > 100000) throw new Error("Invalid page");
  const value = (key: string) => {
    const raw = query[key];
    if (raw === undefined) return "";
    if (typeof raw !== "string") throw new Error("Invalid visitor filters");
    return raw.trim();
  };
  const search = value("search"), type = value("type"), mobile = value("mobile");
  if (search.length > 80 || (search && (!/^[\p{L}\p{N} +\-]+$/u.test(search) || !/[\p{L}\p{N}]/u.test(search))) ||
    !["", "venue", "film", "all", "property"].includes(type) ||
    (mobile && !/^[0-9]{8,15}$/.test(mobile))) throw new Error("Invalid name, phone or activity filter");
  const date = (key: string) => {
    const raw = value(key);
    if (!raw) return "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || !Number.isFinite(Date.parse(raw)) ||
      new Date(raw).toISOString().slice(0, 10) !== raw) throw new Error("Invalid date filter");
    return raw;
  };
  const from = date("from"), to = date("to");
  if (from && to && from > to) throw new Error("Start date must not be after end date");
  return { page, search, type, mobile, from: from ? `${from}T00:00:00.000Z` : null,
    to: to ? new Date(Date.parse(to) + 86400000).toISOString() : null };
}

visitorsRouter.get("/summary", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  let filters;
  try { filters = visitorFilters(req.query); }
  catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid visitor filters" }); return; }
  try {
    const { data, error } = await req.client!.rpc("visitor_activity_summary", {
      p_page: filters.page, p_search: filters.search, p_type: filters.type,
      p_mobile: filters.mobile, p_from: filters.from, p_to: filters.to,
    });
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

visitorsRouter.get("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  let filters;
  try { filters = visitorFilters(req.query); }
  catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid visitor filters" }); return; }
  try {
    let query = req.client!
      .from("visitor_searches")
      .select("id, visitor_name, mobile, search_type, property_slug, requirements, created_at", { count: "exact" });
    if (filters.search) {
      const phone = /^[0-9+ -]+$/.test(filters.search) ? filters.search.replace(/\D/g, "") : filters.search;
      query = query.or(`visitor_name.ilike.%${filters.search}%,mobile_key.ilike.%${phone}%`);
    }
    if (filters.type) query = query.eq("search_type", filters.type);
    if (filters.mobile) query = query.eq("mobile_key", filters.mobile);
    if (filters.from) query = query.gte("created_at", filters.from);
    if (filters.to) query = query.lt("created_at", filters.to);
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id")
      .range(filters.page * 50, filters.page * 50 + 49);
    if (error) throw error;
    res.json({ visitors: data, total: count });
  } catch (error) {
    next(error);
  }
});
