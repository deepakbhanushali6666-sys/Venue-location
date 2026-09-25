import { Router } from "express";
import { venuesRouter } from "./venues.routes.js";
import { leadsRouter } from "./leads.routes.js";
import { subscriptionsRouter } from "./subscriptions.routes.js";
import { paymentsRouter } from "./payments.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { adminRouter } from "./admin.routes.js";
import { profilesRouter } from "./profiles.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { galleryRouter } from "./gallery.routes.js";
import { peopleRouter } from "./people.routes.js";
import { amenitiesRouter } from "./amenities.routes.js";

export const apiRouter = Router();

apiRouter.use("/venues", venuesRouter);
apiRouter.use("/leads", leadsRouter);
apiRouter.use("/subscriptions", subscriptionsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/profiles", profilesRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/gallery", galleryRouter);
apiRouter.use("/people", peopleRouter);
apiRouter.use("/amenities", amenitiesRouter);
