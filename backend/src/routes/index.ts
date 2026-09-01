import { Router } from "express";
import { venuesRouter } from "./venues.routes.js";
import { leadsRouter } from "./leads.routes.js";
import { subscriptionsRouter } from "./subscriptions.routes.js";
import { paymentsRouter } from "./payments.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { adminRouter } from "./admin.routes.js";
import { profilesRouter } from "./profiles.routes.js";

export const apiRouter = Router();

apiRouter.use("/venues", venuesRouter);
apiRouter.use("/leads", leadsRouter);
apiRouter.use("/subscriptions", subscriptionsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/profiles", profilesRouter);
