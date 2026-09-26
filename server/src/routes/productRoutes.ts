import { Router } from "express";
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/productController";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/products",
  requireAuth,
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER),
  createProduct,
);

router.get(
  "/products",
  requireAuth,
  listProducts,
);

router.get(
  "/products/:id",
  requireAuth,
  getProduct,
);

router.patch(
  "/products/:id",
  requireAuth,
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER),
  updateProduct,
);

export default router;