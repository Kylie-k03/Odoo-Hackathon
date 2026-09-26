import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createReceipt,
  getReceipt,
  listReceipts,
} from "../controllers/receiptController";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";

const router = Router();

router.post(
  "/receipts",
  requireAuth,
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.OPERATOR),
  createReceipt,
);

router.get(
  "/receipts",
  requireAuth,
  listReceipts,
);

router.get(
  "/receipts/:id",
  requireAuth,
  getReceipt,
);

export default router;