import crypto from "crypto";
import bcrypt from "bcryptjs";

const OTP_EXPIRY_MINUTES = 10;

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(
  otp: string,
  otpHash: string,
): Promise<boolean> {
  return bcrypt.compare(otp, otpHash);
}

export function getOtpExpiry(): Date {
  return new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
  );
}