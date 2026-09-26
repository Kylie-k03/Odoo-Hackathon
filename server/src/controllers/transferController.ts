import { OperationStatus, Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth";
import * as transferService from "../services/transferService";
import type { QuantityLineInput } from "../services/operationService";
import { asyncHandler } from "../utils/asyncHandler";
import { badRequest } from "../utils/httpError";
import {
  optionalDate,
  optionalEnum,
  optionalString,
  optionalUuid,
  parseDelta,
  parsePagination,
  parseQuantity,
  requireUuid,
} from "../utils/validation";

const OPERATION_STATUSES = Object.values(OperationStatus);
const TRANSFER_FIELDS = ["sourceLocationId", "destinationLocationId", "scheduledDate", "notes", "lines"];
const LINE_FIELDS = ["productId", "quantity", "unitCost"];

function asObject(value: unknown, what: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest(`${what} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

function rejectUnknownFields(body: Record<string, unknown>, allowed: string[], what: string): void {
  const unknownFields = Object.keys(body).filter((field) => !allowed.includes(field));
  if (unknownFields.length > 0) {
    throw badRequest(`Unknown fields in ${what}`, { fields: unknownFields, allowed });
  }
}

/**
 * Optional unit cost: format and precision are checked here; a negative
 * value is rejected by operationService. Omitted → product costPrice.
 */
function optionalUnitCost(value: unknown, field: string): Prisma.Decimal | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === 0 || (typeof value === "string" && /^0{1,8}(\.0{1,4})?$/.test(value.trim()))) {
    return new Prisma.Decimal(0);
  }
  return parseDelta(value, field);
}

function parseLines(value: unknown): QuantityLineInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw badRequest("lines must be a non-empty array");
  }
  return value.map((raw, index) => {
    const line = asObject(raw, `lines[${index}]`);
    rejectUnknownFields(line, LINE_FIELDS, `lines[${index}]`);
    return {
      productId: requireUuid(line.productId, `lines[${index}].productId`),
      quantity: parseQuantity(line.quantity, `lines[${index}].quantity`),
      unitCost: optionalUnitCost(line.unitCost, `lines[${index}].unitCost`),
    };
  });
}

export const createTransfer = asyncHandler<AuthenticatedRequest>(async (req, res) => {
  const body = asObject(req.body ?? {}, "Request body");
  rejectUnknownFields(body, TRANSFER_FIELDS, "request body");

  const data = await transferService.createTransfer(
    {
      sourceLocationId: requireUuid(body.sourceLocationId, "sourceLocationId"),
      destinationLocationId: requireUuid(body.destinationLocationId, "destinationLocationId"),
      scheduledDate: optionalDate(body.scheduledDate, "scheduledDate") ?? null,
      notes: optionalString(body.notes, "notes") ?? null,
      lines: parseLines(body.lines),
    },
    req.user?.userId ?? null,
  );

  res.status(201).json({ data });
});

export const listTransfers = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { transfers, total } = await transferService.listTransfers(
    {
      status: optionalEnum(req.query.status, "status", OPERATION_STATUSES),
      locationId: optionalUuid(req.query.locationId, "locationId"),
      productId: optionalUuid(req.query.productId, "productId"),
      search: optionalString(req.query.search, "search"),
      from: optionalDate(req.query.from, "from"),
      to: optionalDate(req.query.to, "to"),
    },
    pagination,
  );

  res.status(200).json({
    data: transfers,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
});

export const getTransfer = asyncHandler(async (req, res) => {
  const data = await transferService.getTransfer(requireUuid(req.params.id, "id"));
  res.status(200).json({ data });
});
