import { Prisma } from "@prisma/client";
import * as productService from "../services/productService";
import { asyncHandler } from "../utils/asyncHandler";
import { badRequest } from "../utils/httpError";
import {
  optionalString,
  parsePagination,
  parseQuantity,
  requireString,
  requireUuid,
} from "../utils/validation";

const MASTER_DATA_FIELDS = [
  "sku",
  "name",
  "barcode",
  "description",
  "category",
  "unitOfMeasure",
  "costPrice",
  "reorderLevel",
];

const STOCK_FIELDS = ["stock", "onHand", "currentStock", "quantity", "ledger", "stockLedger"];

/**
 * Accepts only product master-data fields. Stock is derived from the
 * ledger and can only change through stock operations.
 */
function readProductBody(body: unknown): Record<string, unknown> {
  if (body === undefined) return {};
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw badRequest("Request body must be a JSON object");
  }

  const fields = Object.keys(body);
  const stockFields = fields.filter((field) => STOCK_FIELDS.includes(field));
  if (stockFields.length > 0) {
    throw badRequest(
      "Stock cannot be set on a product; it is calculated from the stock ledger. Use a receipt, delivery, transfer or adjustment instead.",
      { fields: stockFields },
    );
  }

  const unknownFields = fields.filter((field) => !MASTER_DATA_FIELDS.includes(field));
  if (unknownFields.length > 0) {
    throw badRequest("Unknown fields", { fields: unknownFields, allowed: MASTER_DATA_FIELDS });
  }

  return body as Record<string, unknown>;
}

/** Money / reorder values: Decimal(12, 4), zero allowed, negative rejected. */
function requireNonNegativeDecimal(value: unknown, field: string): Prisma.Decimal {
  if (
    (typeof value === "number" && value < 0) ||
    (typeof value === "string" && value.trim().startsWith("-"))
  ) {
    throw badRequest(`${field} must not be negative`);
  }
  if (value === 0 || (typeof value === "string" && /^0{1,8}(\.0{1,4})?$/.test(value.trim()))) {
    return new Prisma.Decimal(0);
  }
  return parseQuantity(value, field);
}

function optionalNonNegativeDecimal(value: unknown, field: string): Prisma.Decimal | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return requireNonNegativeDecimal(value, field);
}

/** For PATCH: null or "" clears an optional text field. */
function nullableString(value: unknown, field: string): string | null {
  return optionalString(value, field) ?? null;
}

export const createProduct = asyncHandler(async (req, res) => {
  const body = readProductBody(req.body);

  const data = await productService.createProduct({
    sku: requireString(body.sku, "sku"),
    name: requireString(body.name, "name"),
    barcode: optionalString(body.barcode, "barcode"),
    description: optionalString(body.description, "description"),
    category: optionalString(body.category, "category"),
    unitOfMeasure: optionalString(body.unitOfMeasure, "unitOfMeasure"),
    costPrice: optionalNonNegativeDecimal(body.costPrice, "costPrice"),
    reorderLevel: optionalNonNegativeDecimal(body.reorderLevel, "reorderLevel"),
  });

  res.status(201).json({ data });
});

export const listProducts = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { products, total } = await productService.listProducts(
    {
      search: optionalString(req.query.search, "search"),
      category: optionalString(req.query.category, "category"),
    },
    pagination,
  );

  res.status(200).json({
    data: products,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const data = await productService.getProduct(requireUuid(req.params.id, "id"));
  res.status(200).json({ data });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = requireUuid(req.params.id, "id");
  const body = readProductBody(req.body);

  if (Object.keys(body).length === 0) {
    throw badRequest("No fields to update", { allowed: MASTER_DATA_FIELDS });
  }

  const update: productService.ProductUpdateData = {};
  if ("sku" in body) update.sku = requireString(body.sku, "sku");
  if ("name" in body) update.name = requireString(body.name, "name");
  if ("barcode" in body) update.barcode = nullableString(body.barcode, "barcode");
  if ("description" in body) update.description = nullableString(body.description, "description");
  if ("category" in body) update.category = nullableString(body.category, "category");
  if ("unitOfMeasure" in body) {
    update.unitOfMeasure = requireString(body.unitOfMeasure, "unitOfMeasure");
  }
  if ("costPrice" in body) {
    update.costPrice = requireNonNegativeDecimal(body.costPrice, "costPrice");
  }
  if ("reorderLevel" in body) {
    update.reorderLevel = requireNonNegativeDecimal(body.reorderLevel, "reorderLevel");
  }

  const data = await productService.updateProduct(id, update);
  res.status(200).json({ data });
});
