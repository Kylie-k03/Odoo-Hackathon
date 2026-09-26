import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import {
  generateOtp,
  getOtpExpiry,
  hashOtp,
  verifyOtp,
} from "../utils/otp";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        error: "Name, email and password are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName) {
      res.status(400).json({
        error: "Name is required",
      });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({
        error: "Invalid email address",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: "Password must be at least 8 characters",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        error: "An account with this email already exists",
      });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
      },
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[AuthController.register] Error:", error);

    res.status(500).json({
      error: "Internal server error during registration",
    });
  }
}

export async function login(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        error: "Email and password are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({
        error: "Invalid email address",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    const passwordValid = await verifyPassword(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[AuthController.login] Error:", error);

    res.status(500).json({
      error: "Internal server error during login",
    });
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        error: "User no longer exists",
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("[AuthController.getMe] Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
export async function forgotPassword(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { email } = req.body;

    if (typeof email !== "string") {
      res.status(400).json({
        error: "Email is required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({
        error: "Invalid email address",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Do not reveal whether an email exists.
    if (!user) {
      res.status(200).json({
        message:
          "If an account exists with this email, a password reset OTP has been generated.",
      });
      return;
    }

    // Invalidate previous unused OTPs for this user.
    await prisma.passwordResetOtp.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry();

    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    console.log(
      `[Password Reset] OTP for ${normalizedEmail}: ${otp}`,
    );

    res.status(200).json({
      message:
        "If an account exists with this email, a password reset OTP has been generated.",
      ...(process.env.NODE_ENV !== "production" && {
        developmentOtp: otp,
        expiresAt,
      }),
    });
  } catch (error) {
    console.error(
      "[AuthController.forgotPassword] Error:",
      error,
    );

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
export async function verifyPasswordResetOtp(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { email, otp } = req.body;

    if (typeof email !== "string" || typeof otp !== "string") {
      res.status(400).json({
        error: "Email and OTP are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({
        error: "Invalid email address",
      });
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      res.status(400).json({
        error: "OTP must be a 6-digit number",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(400).json({
        error: "Invalid or expired OTP",
      });
      return;
    }

    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        error: "Invalid or expired OTP",
      });
      return;
    }

    if (otpRecord.expiresAt <= new Date()) {
      res.status(400).json({
        error: "OTP has expired",
      });
      return;
    }

    const valid = await verifyOtp(
      normalizedOtp,
      otpRecord.otpHash,
    );

    if (!valid) {
      res.status(400).json({
        error: "Invalid or expired OTP",
      });
      return;
    }

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "[AuthController.verifyPasswordResetOtp] Error:",
      error,
    );

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
export async function resetPassword(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { email, otp, newPassword } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      typeof newPassword !== "string"
    ) {
      res.status(400).json({
        error: "Email, OTP and new password are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({
        error: "Invalid email address",
      });
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      res.status(400).json({
        error: "OTP must be a 6-digit number",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        error: "New password must be at least 8 characters",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(400).json({
        error: "Invalid or expired OTP",
      });
      return;
    }

    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        error: "Invalid or expired OTP",
      });
      return;
    }

    if (otpRecord.expiresAt <= new Date()) {
      res.status(400).json({
        error: "OTP has expired",
      });
      return;
    }

    const valid = await verifyOtp(
      normalizedOtp,
      otpRecord.otpHash,
    );

    if (!valid) {
      res.status(400).json({
        error: "Invalid or expired OTP",
      });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
        },
      }),
      prisma.passwordResetOtp.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      }),
    ]);

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(
      "[AuthController.resetPassword] Error:",
      error,
    );

    res.status(500).json({
      error: "Internal server error during password reset",
    });
  }
}