import { OperationStatus } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth";
import * as adjustmentService from "../services/adjustmentService";
import type { AdjustmentLineInput } from "../services/operationService";
import { asyncHandler } from "../utils/asyncHandler";
import { badRequest } from "../utils/httpError";
import {
  optionalDate,
  optionalEnum,
  optionalString,
  optionalUuid,
  parseDelta,
  parsePagination,
  requireUuid,
} from "../utils/validation";

const OPERATION_STATUSES = Object.values(OperationStatus);
const ADJUSTMENT_FIELDS = ["locationId", "scheduledDate", "notes", "lines"];
const LINE_FIELDS = ["productId", "delta"];

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

function parseLines(value: unknown): AdjustmentLineInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw badRequest("lines must be a non-empty array");
  }
  return value.map((raw, index) => {
    const line = asObject(raw, `lines[${index}]`);
    // operationService values adjustments at the product's costPrice;
    // reject unitCost rather than silently ignoring it.
    if ("unitCost" in line) {
      throw badRequest(
        `lines[${index}].unitCost is not supported for adjustments; the product costPrice is used`,
      );
    }
    rejectUnknownFields(line, LINE_FIELDS, `lines[${index}]`);
    return {
      productId: requireUuid(line.productId, `lines[${index}].productId`),
      delta: parseDelta(line.delta, `lines[${index}].delta`),
    };
  });
}

export const createAdjustment = asyncHandler<AuthenticatedRequest>(async (req, res) => {
  const body = asObject(req.body ?? {}, "Request body");
  rejectUnknownFields(body, ADJUSTMENT_FIELDS, "request body");

  const data = await adjustmentService.createAdjustment(
    {
      locationId: requireUuid(body.locationId, "locationId"),
      scheduledDate: optionalDate(body.scheduledDate, "scheduledDate") ?? null,
      notes: optionalString(body.notes, "notes") ?? null,
      lines: parseLines(body.lines),
    },
    req.user?.userId ?? null,
  );

  res.status(201).json({ data });
});

export const listAdjustments = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { adjustments, total } = await adjustmentService.listAdjustments(
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
    data: adjustments,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
});

export const getAdjustment = asyncHandler(async (req, res) => {
  const data = await adjustmentService.getAdjustment(requireUuid(req.params.id, "id"));
  res.status(200).json({ data });
});
