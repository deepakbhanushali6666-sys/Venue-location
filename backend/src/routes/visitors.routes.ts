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

visitorsRouter.get("/", requireAuth, requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const page = req.query["page"] === undefined ? 0 : Number(req.query["page"]);
    if (!Number.isSafeInteger(page) || page < 0 || page > 100000) {
      res.status(400).json({ error: "Invalid page" });
      return;
    }
    const { data, error, count } = await req.client!
      .from("visitor_searches")
      .select("id, visitor_name, mobile, search_type, property_slug, requirements, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range(page * 50, page * 50 + 49);
    if (error) throw error;
    res.json({ visitors: data, total: count });
  } catch (error) {
    next(error);
  }
});
