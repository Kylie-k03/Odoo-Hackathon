import { OperationStatus, OperationType, Prisma } from "@prisma/client";
import prisma from "../prisma";
import {
  createOperation,
  getOperation,
  operationDetailSelect,
  type AdjustmentInput,
} from "./operationService";

/**
 * Stock adjustments: signed corrections at one physical location.
 * All transaction, locking, stock-check, ledger and reference logic lives
 * in operationService; this module only fixes the operation type.
 * The operation stores the location as both source and destination; the
 * direction of each line is the sign of its ledger entry.
 */

export type AdjustmentCreateData = Omit<AdjustmentInput, "operationType">;

export interface AdjustmentListFilters {
  status?: OperationStatus;
  locationId?: string;
  productId?: string;
  /** Case-insensitive match on the reference. */
  search?: string;
  from?: Date;
  to?: Date;
}

const adjustmentSummarySelect = {
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

export async function createAdjustment(data: AdjustmentCreateData, actorId: string | null) {
  return createOperation({ ...data, operationType: OperationType.ADJUSTMENT }, actorId);
}

export async function getAdjustment(id: string) {
  return getOperation(id, OperationType.ADJUSTMENT);
}

export async function listAdjustments(
  filters: AdjustmentListFilters,
  pagination: { skip: number; take: number },
) {
  const where: Prisma.StockOperationWhereInput = {
    operationType: OperationType.ADJUSTMENT,
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

  const [adjustments, total] = await prisma.$transaction([
    prisma.stockOperation.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
      select: adjustmentSummarySelect,
    }),
    prisma.stockOperation.count({ where }),
  ]);

  return { adjustments, total };
}
