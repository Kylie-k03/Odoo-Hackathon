import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createAdjustment,
  getAdjustment,
  listAdjustments,
} from "../controllers/adjustmentController";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";

const router = Router();

router.post(
  "/adjustments",
  requireAuth,
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER),
  createAdjustment,
);

router.get(
  "/adjustments",
  requireAuth,
  listAdjustments,
);

router.get(
  "/adjustments/:id",
  requireAuth,
  getAdjustment,
);

export default router;
