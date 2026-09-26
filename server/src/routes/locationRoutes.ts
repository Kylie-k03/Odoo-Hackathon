import { Router } from "express";
import { listLocations, listWarehouses } from "../controllers/locationController";

const router = Router();

router.get("/warehouses", listWarehouses);
router.get("/locations", listLocations);

export default router;
