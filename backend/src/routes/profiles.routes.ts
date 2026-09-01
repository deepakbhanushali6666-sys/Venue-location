import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const profilesRouter = Router();

// Auth: a profile is viewable by its own owner or an admin (RLS enforces this too).
profilesRouter.get("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (req.params.id !== req.user!.id && !req.user!.isAdmin) {
      res.status(403).json({ error: "Not allowed to view this profile" });
      return;
    }

    const { data, error } = await req.client!
      .from("profiles")
      .select("full_name, email, mobile")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});
