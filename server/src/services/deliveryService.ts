import { OperationStatus, OperationType, Prisma } from "@prisma/client";
import prisma from "../prisma";
import {
  createOperation,
  getOperation,
  operationDetailSelect,
  type DeliveryInput,
} from "./operationService";

/**
 * Deliveries: outgoing stock from an INTERNAL or OUTPUT location.
 * All transaction, locking, stock-check, ledger and reference logic lives
 * in operationService; this module only fixes the operation type.
 */

export type DeliveryCreateData = Omit<DeliveryInput, "operationType">;

export interface DeliveryListFilters {
  status?: OperationStatus;
  /** Matches either the source or the destination location. */
  locationId?: string;
  productId?: string;
  /** Case-insensitive match on the reference. */
  search?: string;
  from?: Date;
  to?: Date;
}

const deliverySummarySelect = {
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

export async function createDelivery(data: DeliveryCreateData, actorId: string | null) {
  return createOperation({ ...data, operationType: OperationType.DELIVERY }, actorId);
}

export async function getDelivery(id: string) {
  return getOperation(id, OperationType.DELIVERY);
}

export async function listDeliveries(
  filters: DeliveryListFilters,
  pagination: { skip: number; take: number },
) {
  const where: Prisma.StockOperationWhereInput = {
    operationType: OperationType.DELIVERY,
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

  const [deliveries, total] = await prisma.$transaction([
    prisma.stockOperation.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
      select: deliverySummarySelect,
    }),
    prisma.stockOperation.count({ where }),
  ]);

  return { deliveries, total };
}
