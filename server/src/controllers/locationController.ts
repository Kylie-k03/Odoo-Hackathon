import { LocationType } from "@prisma/client";
import * as locationService from "../services/locationService";
import { asyncHandler } from "../utils/asyncHandler";
import { optionalEnum, optionalUuid } from "../utils/validation";

const LOCATION_TYPES = Object.values(LocationType);

export const listWarehouses = asyncHandler(async (_req, res) => {
  const data = await locationService.listWarehouses();
  res.status(200).json({ data });
});

export const listLocations = asyncHandler(async (req, res) => {
  const data = await locationService.listLocations({
    type: optionalEnum(req.query.type, "type", LOCATION_TYPES),
    warehouseId: optionalUuid(req.query.warehouseId, "warehouseId"),
  });
  res.status(200).json({ data });
});
