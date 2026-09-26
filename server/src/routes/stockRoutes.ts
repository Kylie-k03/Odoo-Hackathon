import { Router } from "express";
import {
  getProductStock,
  getStockAt,
  listLedger,
  listStock,
} from "../controllers/stockController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get(
  "/stock",
  requireAuth,
  listStock,
);

router.get(
  "/stock/:productId",
  requireAuth,
  getProductStock,
);

router.get(
  "/stock/:productId/:locationId",
  requireAuth,
  getStockAt,
);

router.get(
  "/stock-ledger",
  requireAuth,
  listLedger,
);

export default router;