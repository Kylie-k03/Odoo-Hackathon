import { OperationStatus, OperationType, Prisma } from "@prisma/client";
import prisma from "../prisma";
import {
  createOperation,
  getOperation,
  operationDetailSelect,
  type TransferInput,
} from "./operationService";

/**
 * Internal transfers: stock moved between two physical locations.
 * All transaction, locking, stock-check, ledger and reference logic lives
 * in operationService; this module only fixes the operation type.
 */

export type TransferCreateData = Omit<TransferInput, "operationType">;

export interface TransferListFilters {
  status?: OperationStatus;
  /** Matches either the source or the destination location. */
  locationId?: string;
  productId?: string;
  /** Case-insensitive match on the reference. */
  search?: string;
  from?: Date;
  to?: Date;
}

const transferSummarySelect = {
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

export async function createTransfer(data: TransferCreateData, actorId: string | null) {
  return createOperation({ ...data, operationType: OperationType.INTERNAL_TRANSFER }, actorId);
}

export async function getTransfer(id: string) {
  return getOperation(id, OperationType.INTERNAL_TRANSFER);
}

export async function listTransfers(
  filters: TransferListFilters,
  pagination: { skip: number; take: number },
) {
  const where: Prisma.StockOperationWhereInput = {
    operationType: OperationType.INTERNAL_TRANSFER,
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

  const [transfers, total] = await prisma.$transaction([
    prisma.stockOperation.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
      select: transferSummarySelect,
    }),
    prisma.stockOperation.count({ where }),
  ]);

  return { transfers, total };
}
