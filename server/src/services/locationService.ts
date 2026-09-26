import type { LocationType } from "@prisma/client";
import prisma from "../prisma";

/** Read-only access to warehouses and locations. */

export async function listWarehouses() {
  return prisma.warehouse.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { locations: true } } },
  });
}

export interface LocationFilters {
  type?: LocationType;
  warehouseId?: string;
}

export async function listLocations(filters: LocationFilters = {}) {
  return prisma.location.findMany({
    where: { type: filters.type, warehouseId: filters.warehouseId },
    orderBy: { code: "asc" },
    include: { warehouse: { select: { id: true, code: true, name: true } } },
  });
}
