import { Router } from "express";
import { UserRole } from "@prisma/client";
import { createDelivery, getDelivery, listDeliveries } from "../controllers/deliveryController";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";

const router = Router();

router.post(
  "/deliveries",
  requireAuth,
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.OPERATOR),
  createDelivery,
);

router.get(
  "/deliveries",
  requireAuth,
  listDeliveries,
);

router.get(
  "/deliveries/:id",
  requireAuth,
  getDelivery,
);

export default router;
