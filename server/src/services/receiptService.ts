import { OperationStatus, OperationType, Prisma } from "@prisma/client";
import prisma from "../prisma";
import {
  createOperation,
  getOperation,
  operationDetailSelect,
  type ReceiptInput,
} from "./operationService";

/**
 * Receipts: incoming stock into an INTERNAL or INPUT location.
 * All transaction, validation, ledger and reference logic lives in
 * operationService; this module only fixes the operation type.
 */

export type ReceiptCreateData = Omit<ReceiptInput, "operationType">;

export interface ReceiptListFilters {
  status?: OperationStatus;
  /** Matches either the source or the destination location. */
  locationId?: string;
  productId?: string;
  /** Case-insensitive match on the reference. */
  search?: string;
  from?: Date;
  to?: Date;
}

const receiptSummarySelect = {
  id: true,
  reference: true,
  operationType: true,
  status: true,
  notes: true,
  scheduledDate: true,
  confirmedAt: true,
  createdAt: true,
  sourceLocation: operationDetailSelect.sourceLocation,
  destinationLocation: operationDetailSelect.destinationLocation,
  createdBy: operationDetailSelect.createdBy,
  _count: { select: { lines: true } },
} satisfies Prisma.StockOperationSelect;

export async function createReceipt(data: ReceiptCreateData, actorId: string | null) {
  return createOperation({ ...data, operationType: OperationType.RECEIPT }, actorId);
}

export async function getReceipt(id: string) {
  return getOperation(id, OperationType.RECEIPT);
}

export async function listReceipts(
  filters: ReceiptListFilters,
  pagination: { skip: number; take: number },
) {
  const where: Prisma.StockOperationWhereInput = {
    operationType: OperationType.RECEIPT,
    status: filters.status,
    reference: filters.search ? { contains: filters.search, mode: "insensitive" } : undefined,
    lines: filters.productId ? { some: { productId: filters.productId } } : undefined,
    OR: filters.locationId
      ? [
          { sourceLocationId: filters.locationId },
          { destinationLocationId: filters.locationId },
        ]
      : undefined,
    createdAt:
      filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined,
  };

  const [receipts, total] = await prisma.$transaction([
    prisma.stockOperation.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
      select: receiptSummarySelect,
    }),
    prisma.stockOperation.count({ where }),
  ]);

  return { receipts, total };
}
