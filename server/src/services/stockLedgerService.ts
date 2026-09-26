import { Prisma, type OperationType } from "@prisma/client";
import prisma from "../prisma";
import { conflict, notFound } from "../utils/httpError";

/**
 * StockLedger is the single source of truth for inventory.
 *
 *  - Stock on hand = SUM(stock_ledger.quantity) per (productId, locationId).
 *  - Quantities are signed: + arrives at a location, - leaves it.
 *  - postEntries() is the ONLY application code that writes ledger rows.
 *    Nothing in the application updates or deletes them.
 *
 * Stock-out protocol (all inside one prisma.$transaction):
 *   const locks = await lockStockKeys(tx, keys);        // advisory locks, sorted
 *   await assertAvailable(tx, locks, requirements);     // SUM after locks are held
 *   await postEntries(tx, { ...operation, entries }, locks);
 * The locks are released automatically when the transaction ends.
 */

type DbClient = Prisma.TransactionClient;

export interface StockKey {
  productId: string;
  locationId: string;
}

export interface StockQuantity extends StockKey {
  quantity: Prisma.Decimal;
}

export interface LedgerEntryInput extends StockQuantity {
  unitCost?: Prisma.Decimal;
}

const ZERO = new Prisma.Decimal(0);

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

function keyOf(key: StockKey): string {
  return `${key.productId}:${key.locationId}`;
}

function compareKeys(a: StockKey, b: StockKey): number {
  const left = keyOf(a);
  const right = keyOf(b);
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Sums quantities that share a (productId, locationId) key and returns them
 * in a deterministic order. Two lines of 60 against a stock of 100 must be
 * checked as 120, not as two separate 60s.
 */
export function aggregateByKey<T extends StockQuantity>(items: T[]): StockQuantity[] {
  const totals = new Map<string, StockQuantity>();
  for (const item of items) {
    const key = keyOf(item);
    const existing = totals.get(key);
    totals.set(key, {
      productId: item.productId,
      locationId: item.locationId,
      quantity: existing ? existing.quantity.plus(item.quantity) : item.quantity,
    });
  }
  return [...totals.values()].sort(compareKeys);
}

function assertTransactionClient(client: DbClient, caller: string): void {
  // Interactive-transaction clients have no $transaction method; the root client does.
  if (typeof (client as { $transaction?: unknown }).$transaction === "function") {
    throw new Error(
      `${caller} must be called with the client from prisma.$transaction(async (tx) => ...)`,
    );
  }
}

/**
 * Proof that advisory locks are held on a set of stock keys in a transaction.
 * Also tracks stock that assertAvailable() has verified but postEntries()
 * has not yet written, so a second check in the same transaction cannot
 * hand out the same stock twice.
 */
class StockLockSet {
  private readonly lockedKeys: Set<string>;
  private readonly reserved = new Map<string, Prisma.Decimal>();

  constructor(
    readonly client: DbClient,
    keys: StockKey[],
  ) {
    this.lockedKeys = new Set(keys.map(keyOf));
  }

  isLocked(key: StockKey): boolean {
    return this.lockedKeys.has(keyOf(key));
  }

  reservedFor(key: StockKey): Prisma.Decimal {
    return this.reserved.get(keyOf(key)) ?? ZERO;
  }

  reserve(item: StockQuantity): void {
    this.reserved.set(keyOf(item), this.reservedFor(item).plus(item.quantity));
  }

  consume(outgoing: StockQuantity[]): void {
    for (const item of outgoing) {
      if (this.reservedFor(item).lt(item.quantity)) {
        throw new Error(
          `Stock-out of ${item.quantity.toString()} for ${keyOf(item)} was not verified by assertAvailable()`,
        );
      }
    }
    for (const item of outgoing) {
      this.reserved.set(keyOf(item), this.reservedFor(item).minus(item.quantity));
    }
  }
}

export type { StockLockSet as StockLocks };

// ─────────────────────────────────────────────
// WRITE PATH (transaction-only)
// ─────────────────────────────────────────────

/**
 * Takes transaction-scoped advisory locks on every (productId, locationId)
 * key, deduplicated and in sorted order so that concurrent multi-line
 * operations can never deadlock. Call once per transaction with all keys.
 */
export async function lockStockKeys(
  tx: DbClient,
  keys: StockKey[],
): Promise<StockLockSet> {
  assertTransactionClient(tx, "lockStockKeys");

  const unique = aggregateByKey(keys.map((key) => ({ ...key, quantity: ZERO })));
  for (const key of unique) {
    // $executeRaw rather than $queryRaw: the function returns void.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key.productId}), hashtext(${key.locationId}))`;
  }

  return new StockLockSet(tx, unique);
}

/**
 * Verifies each (productId, locationId) has at least the required quantity.
 * Must run after lockStockKeys() in the same transaction: under READ
 * COMMITTED this SUM is a fresh snapshot taken while the locks are held,
 * so it sees every stock-out committed by the previous lock holder.
 *
 * Throws 409 "Insufficient stock" listing every shortage.
 */
export async function assertAvailable(
  tx: DbClient,
  locks: StockLockSet,
  requirements: StockQuantity[],
): Promise<void> {
  assertTransactionClient(tx, "assertAvailable");
  if (locks.client !== tx) {
    throw new Error("assertAvailable() received locks from a different transaction");
  }

  const required = aggregateByKey(requirements);
  if (required.length === 0) return;

  for (const item of required) {
    if (item.quantity.lte(0)) {
      throw new Error(`Required quantity for ${keyOf(item)} must be positive`);
    }
    if (!locks.isLocked(item)) {
      throw new Error(`Stock key ${keyOf(item)} must be locked before checking availability`);
    }
  }

  const sums = await tx.stockLedger.groupBy({
    by: ["productId", "locationId"],
    where: {
      OR: required.map(({ productId, locationId }) => ({ productId, locationId })),
    },
    _sum: { quantity: true },
  });
  const onHand = new Map(sums.map((row) => [keyOf(row), row._sum.quantity ?? ZERO]));

  const shortages = required.flatMap((item) => {
    const available = (onHand.get(keyOf(item)) ?? ZERO).minus(locks.reservedFor(item));
    if (available.gte(item.quantity)) return [];
    return [
      {
        productId: item.productId,
        locationId: item.locationId,
        requested: item.quantity.toString(),
        available: available.toString(),
      },
    ];
  });

  if (shortages.length > 0) {
    throw conflict("Insufficient stock", shortages);
  }

  for (const item of required) {
    locks.reserve(item);
  }
}

/**
 * The only application-level writer of StockLedger rows.
 *
 * Every negative entry must have been verified by assertAvailable() on the
 * same locks, otherwise this throws before writing anything. Positive
 * entries need no lock because they can never make stock negative.
 */
export async function postEntries(
  tx: DbClient,
  input: {
    operationId: string;
    reference: string | null;
    createdById: string | null;
    entries: LedgerEntryInput[];
  },
  locks?: StockLockSet,
) {
  assertTransactionClient(tx, "postEntries");

  if (input.entries.length === 0) {
    throw new Error("postEntries() requires at least one entry");
  }
  for (const entry of input.entries) {
    if (entry.quantity.isZero()) {
      throw new Error(`Ledger quantity for ${keyOf(entry)} must not be 0`);
    }
  }

  const outgoing = aggregateByKey(
    input.entries
      .filter((entry) => entry.quantity.isNegative())
      .map((entry) => ({ ...entry, quantity: entry.quantity.negated() })),
  );
  if (outgoing.length > 0) {
    if (!locks || locks.client !== tx) {
      throw new Error(
        "Stock-out ledger entries require lockStockKeys() and assertAvailable() in the same transaction",
      );
    }
    locks.consume(outgoing);
  }

  return tx.stockLedger.createManyAndReturn({
    data: input.entries.map((entry) => ({
      operationId: input.operationId,
      productId: entry.productId,
      locationId: entry.locationId,
      quantity: entry.quantity,
      unitCost: entry.unitCost ?? ZERO,
      reference: input.reference,
      createdById: input.createdById,
    })),
  });
}

// ─────────────────────────────────────────────
// READ PATH
// ─────────────────────────────────────────────

/** Stock on hand for one product at one location. */
export async function getCurrentStock(
  productId: string,
  locationId: string,
  client: DbClient = prisma,
): Promise<Prisma.Decimal> {
  const result = await client.stockLedger.aggregate({
    where: { productId, locationId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? ZERO;
}

export interface StockLevelFilters {
  productId?: string;
  locationId?: string;
  warehouseId?: string;
  /** Include (product, location) pairs whose ledger history nets to 0. */
  includeZero?: boolean;
}

/** Current stock per (product, location), with product and location details. */
export async function getStockLevels(
  filters: StockLevelFilters = {},
  client: DbClient = prisma,
) {
  const groups = await client.stockLedger.groupBy({
    by: ["productId", "locationId"],
    where: {
      productId: filters.productId,
      locationId: filters.locationId,
      location: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined,
    },
    _sum: { quantity: true },
    having: filters.includeZero ? undefined : { quantity: { _sum: { not: 0 } } },
  });

  if (groups.length === 0) return [];

  const [products, locations] = await Promise.all([
    client.product.findMany({
      where: { id: { in: [...new Set(groups.map((g) => g.productId))] } },
      select: productSummary,
    }),
    client.location.findMany({
      where: { id: { in: [...new Set(groups.map((g) => g.locationId))] } },
      select: locationSummary,
    }),
  ]);
  const productsById = new Map(products.map((p) => [p.id, p]));
  const locationsById = new Map(locations.map((l) => [l.id, l]));

  return groups
    .map((group) => ({
      product: productsById.get(group.productId)!,
      location: locationsById.get(group.locationId)!,
      quantity: group._sum.quantity ?? ZERO,
    }))
    .sort(
      (a, b) =>
        a.product.sku.localeCompare(b.product.sku) ||
        a.location.code.localeCompare(b.location.code),
    );
}

/** One product's stock broken down by location, plus its total on hand. */
export async function getProductStock(productId: string, client: DbClient = prisma) {
  const product = await client.product.findUnique({
    where: { id: productId },
    select: productSummary,
  });
  if (!product) throw notFound("Product not found");

  const levels = await getStockLevels({ productId }, client);
  const total = levels.reduce((sum, level) => sum.plus(level.quantity), ZERO);

  return {
    product,
    total,
    locations: levels.map(({ location, quantity }) => ({ location, quantity })),
  };
}

/** Stock for one (product, location) pair; 404 if either does not exist. */
export async function getStockAt(productId: string, locationId: string) {
  const [product, location] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: productSummary }),
    prisma.location.findUnique({ where: { id: locationId }, select: locationSummary }),
  ]);
  if (!product) throw notFound("Product not found");
  if (!location) throw notFound("Location not found");

  const quantity = await getCurrentStock(productId, locationId);
  return { product, location, quantity };
}

export interface LedgerFilters {
  productId?: string;
  locationId?: string;
  warehouseId?: string;
  operationId?: string;
  operationType?: OperationType;
  from?: Date;
  to?: Date;
}

/** Ledger history, newest first, paginated. */
export async function getLedger(
  filters: LedgerFilters,
  pagination: { skip: number; take: number },
) {
  const where: Prisma.StockLedgerWhereInput = {
    productId: filters.productId,
    locationId: filters.locationId,
    operationId: filters.operationId,
    location: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined,
    operation: filters.operationType ? { operationType: filters.operationType } : undefined,
    createdAt:
      filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined,
  };

  const [entries, total] = await prisma.$transaction([
    prisma.stockLedger.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        quantity: true,
        unitCost: true,
        reference: true,
        createdAt: true,
        product: { select: productSummary },
        location: { select: locationSummary },
        operation: { select: { id: true, reference: true, operationType: true } },
        // Explicit select: never expose User.passwordHash.
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.stockLedger.count({ where }),
  ]);

  return { entries, total };
}
