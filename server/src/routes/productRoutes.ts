import { Router } from "express";
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/productController";

const router = Router();

router.post("/products", createProduct);
router.get("/products", listProducts);
router.get("/products/:id", getProduct);
router.patch("/products/:id", updateProduct);

export default router;
