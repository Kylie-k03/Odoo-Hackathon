import { Router } from "express";
import {
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword,
  verifyPasswordResetOtp,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getMe);

export default router;