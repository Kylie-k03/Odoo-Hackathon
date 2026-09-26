import { randomBytes } from "node:crypto";
import {
  LocationType,
  OperationStatus,
  OperationType,
  Prisma,
} from "@prisma/client";
import prisma from "../prisma";
import { badRequest, notFound } from "../utils/httpError";
import {
  aggregateByKey,
  assertAvailable,
  lockStockKeys,
  postEntries,
  type LedgerEntryInput,
  type StockLocks,
} from "./stockLedgerService";

/**
 * Shared foundation for every stock operation.
 *
 * Each operation is created already CONFIRMED, in one transaction:
 *   1. validate locations and products
 *   2. lock the stock keys that lose stock (sorted advisory locks)
 *   3. assertAvailable() on exactly those stock-outs
 *   4. create StockOperation + StockOperationLine rows
 *   5. postEntries() with the same signed movements
 * Any failure rolls back all of it.
 *
 * StockOperationLine.quantity is always the absolute amount; the sign lives
 * only on the StockLedger rows.
 */

type DbClient = Prisma.TransactionClient;

// ─────────────────────────────────────────────
// INPUT TYPES (plain service-layer values, no Express)
// ─────────────────────────────────────────────

export interface QuantityLineInput {
  productId: string;
  quantity: Prisma.Decimal;
  unitCost?: Prisma.Decimal;
}

export interface AdjustmentLineInput {
  productId: string;
  delta: Prisma.Decimal;
}

interface CommonOperationInput {
  notes?: string | null;
  scheduledDate?: Date | null;
}

export interface ReceiptInput extends CommonOperationInput {
  operationType: typeof OperationType.RECEIPT;
  destinationLocationId: string;
  /** Optional SUPPLIER location, recorded on the operation only. */
  sourceLocationId?: string | null;
  lines: QuantityLineInput[];
}

export interface DeliveryInput extends CommonOperationInput {
  operationType: typeof OperationType.DELIVERY;
  sourceLocationId: string;
  /** Optional CUSTOMER location, recorded on the operation only. */
  destinationLocationId?: string | null;
  lines: QuantityLineInput[];
}

export interface TransferInput extends CommonOperationInput {
  operationType: typeof OperationType.INTERNAL_TRANSFER;
  sourceLocationId: string;
  destinationLocationId: string;
  lines: QuantityLineInput[];
}

export interface AdjustmentInput extends CommonOperationInput {
  operationType: typeof OperationType.ADJUSTMENT;
  locationId: string;
  lines: AdjustmentLineInput[];
}

export type OperationInput = ReceiptInput | DeliveryInput | TransferInput | AdjustmentInput;

// ─────────────────────────────────────────────
// RULES
// ─────────────────────────────────────────────

const VIRTUAL_LOCATION_TYPES: readonly LocationType[] = [
  LocationType.SUPPLIER,
  LocationType.CUSTOMER,
  LocationType.SCRAP,
];

const PHYSICAL_LOCATION_TYPES: readonly LocationType[] = Object.values(LocationType).filter(
  (type) => !VIRTUAL_LOCATION_TYPES.includes(type),
);

const REFERENCE_PREFIX: Record<OperationType, string> = {
  RECEIPT: "REC",
  DELIVERY: "DEL",
  INTERNAL_TRANSFER: "TRF",
  ADJUSTMENT: "ADJ",
};

const MAX_LINES = 200;
const MAX_REFERENCE_ATTEMPTS = 3;
const ZERO = new Prisma.Decimal(0);
// Decimal(12, 4): at most 8 integer digits.
const MAX_QUANTITY_EXCLUSIVE = new Prisma.Decimal("100000000");

interface LocationRule {
  role: "source" | "destination" | "location";
  id: string;
  allowed: readonly LocationType[];
}

// ─────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────

function assertDecimalShape(value: unknown, field: string): asserts value is Prisma.Decimal {
  if (!Prisma.Decimal.isDecimal(value)) {
    throw badRequest(`${field} must be a number`);
  }
  if (value.decimalPlaces() > 4 || value.abs().gte(MAX_QUANTITY_EXCLUSIVE)) {
    throw badRequest(
      `${field} must be a number with at most 8 integer digits and 4 decimal places`,
    );
  }
}

export function assertPositiveQuantity(value: unknown, field: string): Prisma.Decimal {
  assertDecimalShape(value, field);
  if (value.lte(0)) throw badRequest(`${field} must be greater than 0`);
  return value;
}

export function assertNonZeroDelta(value: unknown, field: string): Prisma.Decimal {
  assertDecimalShape(value, field);
  if (value.isZero()) throw badRequest(`${field} must not be 0`);
  return value;
}

function assertLines(lines: { productId: string }[]): void {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw badRequest("At least one line is required");
  }
  if (lines.length > MAX_LINES) {
    throw badRequest(`An operation may have at most ${MAX_LINES} lines`);
  }
  lines.forEach((line, index) => {
    if (typeof line?.productId !== "string" || !line.productId) {
      throw badRequest(`lines[${index}].productId is required`);
    }
  });
}

/**
 * Loads the referenced locations and checks each one's type.
 * Unknown ids and wrong types are request errors (400).
 */
export async function validateLocations(tx: DbClient, rules: LocationRule[]): Promise<void> {
  const ids = [...new Set(rules.map((rule) => rule.id))];
  const locations = await tx.location.findMany({
    where: { id: { in: ids } },
    select: { id: true, code: true, type: true },
  });
  const byId = new Map(locations.map((location) => [location.id, location]));

  for (const rule of rules) {
    const location = byId.get(rule.id);
    if (!location) {
      throw badRequest(`${rule.role} location not found`, { locationId: rule.id });
    }
    if (!rule.allowed.includes(location.type)) {
      throw badRequest(
        `${rule.role} location ${location.code} has type ${location.type}; expected one of: ${rule.allowed.join(", ")}`,
        { locationId: rule.id, type: location.type },
      );
    }
  }
}

/** Ensures every product exists; returns their cost prices for ledger valuation. */
export async function validateProducts(
  tx: DbClient,
  productIds: string[],
): Promise<Map<string, Prisma.Decimal>> {
  const ids = [...new Set(productIds)];
  const products = await tx.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, costPrice: true },
  });
  const costById = new Map(products.map((product) => [product.id, product.costPrice]));

  const missing = ids.filter((id) => !costById.has(id));
  if (missing.length > 0) {
    throw badRequest("Unknown products", { productIds: missing });
  }
  return costById;
}

// ─────────────────────────────────────────────
// LINE MERGING
// ─────────────────────────────────────────────

interface MergedLine {
  productId: string;
  quantity: Prisma.Decimal;
  unitCost?: Prisma.Decimal;
}

/**
 * Validates quantity lines and merges duplicates per product, so the stored
 * line, the checked stock-out and the written ledger entry are one amount.
 */
function mergeQuantityLines(lines: QuantityLineInput[]): MergedLine[] {
  assertLines(lines);
  const merged = new Map<string, MergedLine>();

  lines.forEach((line, index) => {
    const quantity = assertPositiveQuantity(line.quantity, `lines[${index}].quantity`);
    const unitCost =
      line.unitCost === undefined ? undefined : assertUnitCost(line.unitCost, index);

    const existing = merged.get(line.productId);
    if (!existing) {
      merged.set(line.productId, { productId: line.productId, quantity, unitCost });
      return;
    }
    if (!sameOptionalDecimal(existing.unitCost, unitCost)) {
      throw badRequest("Duplicate lines for the same product must have the same unitCost", {
        productId: line.productId,
      });
    }
    existing.quantity = existing.quantity.plus(quantity);
  });

  const result = [...merged.values()];
  assertMergedWithinLimit(result.map((line) => ({ productId: line.productId, amount: line.quantity })));
  return result;
}

/** Merging duplicates can push a total past the Decimal(12, 4) column limit. */
function assertMergedWithinLimit(lines: { productId: string; amount: Prisma.Decimal }[]): void {
  const tooLarge = lines.filter((line) => line.amount.abs().gte(MAX_QUANTITY_EXCLUSIVE));
  if (tooLarge.length > 0) {
    throw badRequest("Combined quantity per product exceeds the maximum of 99999999.9999", {
      productIds: tooLarge.map((line) => line.productId),
    });
  }
}

/** Sums signed deltas per product; a net-zero product is rejected. */
function mergeAdjustmentLines(lines: AdjustmentLineInput[]): { productId: string; delta: Prisma.Decimal }[] {
  assertLines(lines);
  const merged = new Map<string, Prisma.Decimal>();

  lines.forEach((line, index) => {
    const delta = assertNonZeroDelta(line.delta, `lines[${index}].delta`);
    merged.set(line.productId, (merged.get(line.productId) ?? ZERO).plus(delta));
  });

  const result = [...merged.entries()].map(([productId, delta]) => ({ productId, delta }));
  const netZero = result.filter((line) => line.delta.isZero());
  if (netZero.length > 0) {
    throw badRequest("Adjustment lines for a product must not net to 0", {
      productIds: netZero.map((line) => line.productId),
    });
  }
  assertMergedWithinLimit(result.map((line) => ({ productId: line.productId, amount: line.delta })));
  return result;
}

function assertUnitCost(value: unknown, index: number): Prisma.Decimal {
  assertDecimalShape(value, `lines[${index}].unitCost`);
  if (value.isNegative()) throw badRequest(`lines[${index}].unitCost must not be negative`);
  return value;
}

function sameOptionalDecimal(a?: Prisma.Decimal, b?: Prisma.Decimal): boolean {
  if (a === undefined || b === undefined) return a === b;
  return a.equals(b);
}

// ─────────────────────────────────────────────
// PLANS: what to store and what to post
// ─────────────────────────────────────────────

interface OperationPlan {
  operationType: OperationType;
  sourceLocationId: string | null;
  destinationLocationId: string | null;
  notes: string | null;
  scheduledDate: Date | null;
  locationRules: LocationRule[];
  lines: MergedLine[];
  /** Signed ledger movements; unitCost is filled from the product when absent. */
  movements: LedgerEntryInput[];
}

function buildPlan(input: OperationInput): OperationPlan {
  const common = {
    operationType: input.operationType,
    notes: input.notes ?? null,
    scheduledDate: input.scheduledDate ?? null,
  };

  switch (input.operationType) {
    case OperationType.RECEIPT: {
      const lines = mergeQuantityLines(input.lines);
      const rules: LocationRule[] = [
        {
          role: "destination",
          id: input.destinationLocationId,
          allowed: [LocationType.INTERNAL, LocationType.INPUT],
        },
      ];
      if (input.sourceLocationId) {
        rules.push({ role: "source", id: input.sourceLocationId, allowed: [LocationType.SUPPLIER] });
      }
      return {
        ...common,
        sourceLocationId: input.sourceLocationId ?? null,
        destinationLocationId: input.destinationLocationId,
        locationRules: rules,
        lines,
        movements: lines.map((line) => ({
          productId: line.productId,
          locationId: input.destinationLocationId,
          quantity: line.quantity,
          unitCost: line.unitCost,
        })),
      };
    }

    case OperationType.DELIVERY: {
      const lines = mergeQuantityLines(input.lines);
      const rules: LocationRule[] = [
        {
          role: "source",
          id: input.sourceLocationId,
          allowed: [LocationType.INTERNAL, LocationType.OUTPUT],
        },
      ];
      if (input.destinationLocationId) {
        rules.push({
          role: "destination",
          id: input.destinationLocationId,
          allowed: [LocationType.CUSTOMER],
        });
      }
      return {
        ...common,
        sourceLocationId: input.sourceLocationId,
        destinationLocationId: input.destinationLocationId ?? null,
        locationRules: rules,
        lines,
        movements: lines.map((line) => ({
          productId: line.productId,
          locationId: input.sourceLocationId,
          quantity: line.quantity.negated(),
          unitCost: line.unitCost,
        })),
      };
    }

    case OperationType.INTERNAL_TRANSFER: {
      if (input.sourceLocationId === input.destinationLocationId) {
        throw badRequest("Source and destination locations must be different");
      }
      const lines = mergeQuantityLines(input.lines);
      return {
        ...common,
        sourceLocationId: input.sourceLocationId,
        destinationLocationId: input.destinationLocationId,
        locationRules: [
          { role: "source", id: input.sourceLocationId, allowed: PHYSICAL_LOCATION_TYPES },
          { role: "destination", id: input.destinationLocationId, allowed: PHYSICAL_LOCATION_TYPES },
        ],
        lines,
        movements: lines.flatMap((line) => [
          {
            productId: line.productId,
            locationId: input.sourceLocationId,
            quantity: line.quantity.negated(),
            unitCost: line.unitCost,
          },
          {
            productId: line.productId,
            locationId: input.destinationLocationId,
            quantity: line.quantity,
            unitCost: line.unitCost,
          },
        ]),
      };
    }

    case OperationType.ADJUSTMENT: {
      const deltas = mergeAdjustmentLines(input.lines);
      return {
        ...common,
        // One location per adjustment; direction is carried by the ledger sign.
        sourceLocationId: input.locationId,
        destinationLocationId: input.locationId,
        locationRules: [
          { role: "location", id: input.locationId, allowed: PHYSICAL_LOCATION_TYPES },
        ],
        lines: deltas.map((line) => ({ productId: line.productId, quantity: line.delta.abs() })),
        movements: deltas.map((line) => ({
          productId: line.productId,
          locationId: input.locationId,
          quantity: line.delta,
        })),
      };
    }

    default: {
      const unknownType: never = input;
      throw badRequest(`Unsupported operation type: ${(unknownType as OperationInput).operationType}`);
    }
  }
}

// ─────────────────────────────────────────────
// REFERENCES
// ─────────────────────────────────────────────

// Crockford base32: no I, L, O, U — easy to read aloud and type.
const REFERENCE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * e.g. REC-20260926-K7Q2M9XD — 40 random bits per reference, no counter,
 * nothing read from the database. The unique index on reference is the
 * final guard; a collision is retried by createOperation().
 */
export function generateReference(operationType: OperationType, date = new Date()): string {
  const day = date.toISOString().slice(0, 10).replace(/-/g, "");
  // 256 is a multiple of 32, so masking each byte to 5 bits is unbiased.
  const suffix = [...randomBytes(8)].map((byte) => REFERENCE_ALPHABET[byte & 31]).join("");
  return `${REFERENCE_PREFIX[operationType]}-${day}-${suffix}`;
}

function isReferenceCollision(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }
  const target = error.meta?.target;
  return Array.isArray(target) ? target.includes("reference") : String(target).includes("reference");
}

// ─────────────────────────────────────────────
// OUTPUT SHAPE
// ─────────────────────────────────────────────

const productSummary = {
  id: true,
  sku: true,
  name: true,
  unitOfMeasure: true,
} satisfies Prisma.ProductSelect;

const locationSummary = {
  id: true,
  code: true,
  name: true,
  type: true,
  warehouseId: true,
} satisfies Prisma.LocationSelect;

export const operationDetailSelect = {
  id: true,
  reference: true,
  operationType: true,
  status: true,
  notes: true,
  scheduledDate: true,
  confirmedAt: true,
  createdAt: true,
  updatedAt: true,
  sourceLocation: { select: locationSummary },
  destinationLocation: { select: locationSummary },
  // Explicit select: never expose User.passwordHash.
  createdBy: { select: { id: true, name: true } },
  lines: {
    select: { id: true, quantity: true, unitCost: true, product: { select: productSummary } },
  },
  ledgerEntries: {
    select: {
      id: true,
      productId: true,
      locationId: true,
      quantity: true,
      unitCost: true,
      createdAt: true,
    },
    orderBy: [{ locationId: "asc" }, { productId: "asc" }],
  },
} satisfies Prisma.StockOperationSelect;

/** One operation with lines and ledger entries; 404 unless it has the expected type. */
export async function getOperation(id: string, operationType: OperationType) {
  const operation = await prisma.stockOperation.findUnique({
    where: { id },
    select: operationDetailSelect,
  });
  if (!operation || operation.operationType !== operationType) {
    throw notFound("Operation not found");
  }
  return operation;
}

// ─────────────────────────────────────────────
// EXECUTION
// ─────────────────────────────────────────────

async function transactionTimestamp(tx: DbClient): Promise<Date> {
  // now() is fixed at transaction start, matching the ledger rows' createdAt default.
  const [row] = await tx.$queryRaw<{ now: Date }[]>`SELECT now() AS now`;
  return row.now;
}

async function executePlan(
  tx: DbClient,
  plan: OperationPlan,
  reference: string,
  actorId: string | null,
) {
  await validateLocations(tx, plan.locationRules);
  const costById = await validateProducts(
    tx,
    plan.lines.map((line) => line.productId),
  );

  // Stock-outs only. The same movements array is later passed to
  // postEntries(), so the amount checked is exactly the amount written.
  const stockOuts = aggregateByKey(
    plan.movements
      .filter((movement) => movement.quantity.isNegative())
      .map((movement) => ({ ...movement, quantity: movement.quantity.negated() })),
  );

  let locks: StockLocks | undefined;
  if (stockOuts.length > 0) {
    locks = await lockStockKeys(tx, stockOuts);
    await assertAvailable(tx, locks, stockOuts);
  }

  const confirmedAt = await transactionTimestamp(tx);
  const costOf = (productId: string, unitCost?: Prisma.Decimal) =>
    unitCost ?? costById.get(productId) ?? ZERO;

  const operation = await tx.stockOperation.create({
    data: {
      reference,
      operationType: plan.operationType,
      status: OperationStatus.CONFIRMED,
      confirmedAt,
      sourceLocationId: plan.sourceLocationId,
      destinationLocationId: plan.destinationLocationId,
      createdById: actorId,
      notes: plan.notes,
      scheduledDate: plan.scheduledDate,
      lines: {
        create: plan.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitCost: costOf(line.productId, line.unitCost),
        })),
      },
    },
    select: { id: true, reference: true },
  });

  await postEntries(
    tx,
    {
      operationId: operation.id,
      reference: operation.reference,
      createdById: actorId,
      entries: plan.movements.map((movement) => ({
        ...movement,
        unitCost: costOf(movement.productId, movement.unitCost),
      })),
    },
    locks,
  );

  return tx.stockOperation.findUniqueOrThrow({
    where: { id: operation.id },
    select: operationDetailSelect,
  });
}

/**
 * Creates a CONFIRMED operation, its lines and its ledger entries atomically.
 * actorId is the authenticated user's id, or null before auth is wired in.
 */
export async function createOperation(input: OperationInput, actorId: string | null) {
  const plan = buildPlan(input);

  for (let attempt = 1; ; attempt++) {
    const reference = generateReference(plan.operationType);
    try {
      return await prisma.$transaction((tx) => executePlan(tx, plan, reference, actorId), {
        // The advisory-lock design relies on each statement seeing fresh commits.
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        maxWait: 5_000,
        timeout: 10_000,
      });
    } catch (error) {
      // A reference collision aborts the whole transaction, so retry all of it.
      if (isReferenceCollision(error) && attempt < MAX_REFERENCE_ATTEMPTS) continue;
      throw error;
    }
  }
}
