import { Router } from "express";
import {
  getProductStock,
  getStockAt,
  listLedger,
  listStock,
} from "../controllers/stockController";

const router = Router();

router.get("/stock", listStock);
router.get("/stock/:productId", getProductStock);
router.get("/stock/:productId/:locationId", getStockAt);
router.get("/stock-ledger", listLedger);

export default router;
