import { Router } from "express";
import { listLocations, listWarehouses } from "../controllers/locationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/warehouses", requireAuth, listWarehouses);
router.get("/locations", requireAuth, listLocations);

export default router;