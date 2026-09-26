import { Router } from "express";
import { UserRole } from "@prisma/client";
import { createTransfer, getTransfer, listTransfers } from "../controllers/transferController";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";

const router = Router();

router.post(
  "/transfers",
  requireAuth,
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.OPERATOR),
  createTransfer,
);

router.get(
  "/transfers",
  requireAuth,
  listTransfers,
);

router.get(
  "/transfers/:id",
  requireAuth,
  getTransfer,
);

export default router;
