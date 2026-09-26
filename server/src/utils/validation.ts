import { Prisma } from "@prisma/client";
import { badRequest } from "./httpError";

/**
 * Lightweight request validators. Each one returns a typed value or
 * throws a 400 HttpError naming the offending field.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Matches the Decimal(12, 4) columns: up to 8 integer digits, 4 fractional.
const DECIMAL_PATTERN = /^-?\d{1,8}(\.\d{1,4})?$/;

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`${field} is required`);
  }
  return value.trim();
}

export function optionalString(value: unknown, field: string): string | undefined {
  if (isMissing(value)) return undefined;
  return requireString(value, field);
}

export function requireUuid(value: unknown, field: string): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw badRequest(`${field} must be a valid id`);
  }
  return value;
}

export function optionalUuid(value: unknown, field: string): string | undefined {
  if (isMissing(value)) return undefined;
  return requireUuid(value, field);
}

export function optionalEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T | undefined {
  if (isMissing(value)) return undefined;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw badRequest(`${field} must be one of: ${allowed.join(", ")}`);
  }
  return value as T;
}

export function optionalDate(value: unknown, field: string): Date | undefined {
  if (isMissing(value)) return undefined;
  if (typeof value !== "string") {
    throw badRequest(`${field} must be an ISO date string`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw badRequest(`${field} must be an ISO date string`);
  }
  return date;
}

export function optionalBoolean(value: unknown, field: string): boolean | undefined {
  if (isMissing(value)) return undefined;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw badRequest(`${field} must be true or false`);
}

export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePagination(
  query: { page?: unknown; pageSize?: unknown },
  defaults = { pageSize: 50, maxPageSize: 200 },
): Pagination {
  const page = parsePositiveInt(query.page, "page") ?? 1;
  const pageSize = parsePositiveInt(query.pageSize, "pageSize") ?? defaults.pageSize;

  if (pageSize > defaults.maxPageSize) {
    throw badRequest(`pageSize must be at most ${defaults.maxPageSize}`);
  }

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

function parsePositiveInt(value: unknown, field: string): number | undefined {
  if (isMissing(value)) return undefined;
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isInteger(parsed) || parsed < 1) {
    throw badRequest(`${field} must be a positive integer`);
  }
  return parsed;
}

/**
 * Parses a Decimal(12, 4) value from a JSON number or numeric string
 * without ever doing float arithmetic on it.
 */
function parseDecimal(value: unknown, field: string): Prisma.Decimal {
  let text: string;
  if (typeof value === "string") {
    text = value.trim();
  } else if (typeof value === "number" && Number.isFinite(value)) {
    text = String(value);
  } else {
    throw badRequest(`${field} must be a number`);
  }

  if (!DECIMAL_PATTERN.test(text)) {
    throw badRequest(
      `${field} must be a number with at most 8 integer digits and 4 decimal places`,
    );
  }
  return new Prisma.Decimal(text);
}

/** A strictly positive quantity (operation lines). */
export function parseQuantity(value: unknown, field: string): Prisma.Decimal {
  const quantity = parseDecimal(value, field);
  if (quantity.lte(0)) {
    throw badRequest(`${field} must be greater than 0`);
  }
  return quantity;
}

/** A signed, non-zero quantity (stock adjustment lines). */
export function parseDelta(value: unknown, field: string): Prisma.Decimal {
  const delta = parseDecimal(value, field);
  if (delta.isZero()) {
    throw badRequest(`${field} must not be 0`);
  }
  return delta;
}
