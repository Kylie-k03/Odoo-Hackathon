import { NextFunction, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  AuthenticatedRequest,
} from "./auth";

export function requireRoles(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: "Insufficient permissions",
      });
      return;
    }

    next();
  };
}