import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/httpError";

interface ErrorBody {
  error: string;
  details?: unknown;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function fromPrismaError(
  err: Prisma.PrismaClientKnownRequestError,
): { status: number; body: ErrorBody } | undefined {
  switch (err.code) {
    case "P2002":
      return {
        status: 409,
        body: {
          error: "A record with this value already exists",
          details: { fields: err.meta?.target },
        },
      };
    case "P2025":
      return { status: 404, body: { error: "Record not found" } };
    case "P2003": {
      // A JWT for a user that has since been deleted fails the createdById FK.
      const fieldName = String(err.meta?.field_name ?? "");
      if (fieldName.includes("createdById")) {
        return { status: 401, body: { error: "User no longer exists" } };
      }
      return { status: 400, body: { error: "Referenced record does not exist" } };
    }
    case "P2028":
    case "P2034":
      return {
        status: 503,
        body: { error: "The database is busy, please retry the request" },
      };
    default:
      return undefined;
  }
}

/**
 * Final middleware: converts thrown errors into JSON responses.
 * Unknown errors become a generic 500; details are only included
 * outside production.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    const body: ErrorBody = { error: err.message };
    if (err.details !== undefined) body.details = err.details;
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = fromPrismaError(err);
    if (mapped) {
      res.status(mapped.status).json(mapped.body);
      return;
    }
  }

  // body-parser errors (malformed JSON, payload too large) carry a safe 4xx status.
  const status = typeof err?.status === "number" ? err.status : undefined;
  if (status && status >= 400 && status < 500 && err.expose) {
    res.status(status).json({ error: err.message });
    return;
  }

  console.error("[ErrorHandler] Unhandled error:", err);

  const body: ErrorBody = { error: "Internal server error" };
  if (!isProduction() && err instanceof Error) body.details = err.message;
  res.status(500).json(body);
};
