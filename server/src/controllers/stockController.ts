import { OperationType } from "@prisma/client";
import * as stockLedgerService from "../services/stockLedgerService";
import { asyncHandler } from "../utils/asyncHandler";
import {
  optionalBoolean,
  optionalDate,
  optionalEnum,
  optionalUuid,
  parsePagination,
  requireUuid,
} from "../utils/validation";

const OPERATION_TYPES = Object.values(OperationType);

export const listStock = asyncHandler(async (req, res) => {
  const data = await stockLedgerService.getStockLevels({
    productId: optionalUuid(req.query.productId, "productId"),
    locationId: optionalUuid(req.query.locationId, "locationId"),
    warehouseId: optionalUuid(req.query.warehouseId, "warehouseId"),
    includeZero: optionalBoolean(req.query.includeZero, "includeZero"),
  });
  res.status(200).json({ data });
});

export const getProductStock = asyncHandler(async (req, res) => {
  const data = await stockLedgerService.getProductStock(
    requireUuid(req.params.productId, "productId"),
  );
  res.status(200).json({ data });
});

export const getStockAt = asyncHandler(async (req, res) => {
  const data = await stockLedgerService.getStockAt(
    requireUuid(req.params.productId, "productId"),
    requireUuid(req.params.locationId, "locationId"),
  );
  res.status(200).json({ data });
});

export const listLedger = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { entries, total } = await stockLedgerService.getLedger(
    {
      productId: optionalUuid(req.query.productId, "productId"),
      locationId: optionalUuid(req.query.locationId, "locationId"),
      warehouseId: optionalUuid(req.query.warehouseId, "warehouseId"),
      operationId: optionalUuid(req.query.operationId, "operationId"),
      operationType: optionalEnum(req.query.operationType, "operationType", OPERATION_TYPES),
      from: optionalDate(req.query.from, "from"),
      to: optionalDate(req.query.to, "to"),
    },
    pagination,
  );
  res.status(200).json({
    data: entries,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
});
