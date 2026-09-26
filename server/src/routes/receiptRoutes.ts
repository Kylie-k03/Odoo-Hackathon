import { Router } from "express";
import { createReceipt, getReceipt, listReceipts } from "../controllers/receiptController";

const router = Router();

router.post("/receipts", createReceipt);
router.get("/receipts", listReceipts);
router.get("/receipts/:id", getReceipt);

export default router;
