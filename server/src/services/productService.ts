import { Prisma, type Product } from "@prisma/client";
import prisma from "../prisma";
import { notFound } from "../utils/httpError";
import { getProductStock } from "./stockLedgerService";

/**
 * Product master data. Products have no stock field: onHand is always
 * derived from StockLedger. There is no delete, because ledger rows
 * reference products with ON DELETE RESTRICT.
 */

const ZERO = new Prisma.Decimal(0);

export interface ProductCreateData {
  sku: string;
  name: string;
  barcode?: string;
  description?: string;
  category?: string;
  unitOfMeasure?: string;
  costPrice?: Prisma.Decimal;
  reorderLevel?: Prisma.Decimal;
}

export interface ProductUpdateData {
  sku?: string;
  name?: string;
  barcode?: string | null;
  description?: string | null;
  category?: string | null;
  unitOfMeasure?: string;
  costPrice?: Prisma.Decimal;
  reorderLevel?: Prisma.Decimal;
}

export interface ProductListFilters {
  search?: string;
  category?: string;
}

function withStockStatus(product: Product, onHand: Prisma.Decimal) {
  return { ...product, onHand, belowReorder: onHand.lt(product.reorderLevel) };
}

/**
 * Total on hand across all locations for each product, from StockLedger.
 * Products with no ledger rows are absent from the map (i.e. 0).
 */
async function getOnHandTotals(productIds: string[]): Promise<Map<string, Prisma.Decimal>> {
  if (productIds.length === 0) return new Map();

  const sums = await prisma.stockLedger.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _sum: { quantity: true },
  });
  return new Map(sums.map((row) => [row.productId, row._sum.quantity ?? ZERO]));
}

export async function createProduct(data: ProductCreateData): Promise<Product> {
  return prisma.product.create({
    data: {
      ...data,
      costPrice: data.costPrice ?? ZERO,
      reorderLevel: data.reorderLevel ?? ZERO,
    },
  });
}

export async function listProducts(
  filters: ProductListFilters,
  pagination: { skip: number; take: number },
) {
  const search = filters.search;
  const where: Prisma.ProductWhereInput = {
    category: filters.category
      ? { equals: filters.category, mode: "insensitive" }
      : undefined,
    OR: search
      ? [
          { sku: { contains: search, mode: "insensitive" } },
          { barcode: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { sku: "asc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.product.count({ where }),
  ]);

  const onHandById = await getOnHandTotals(products.map((product) => product.id));

  return {
    products: products.map((product) =>
      withStockStatus(product, onHandById.get(product.id) ?? ZERO),
    ),
    total,
  };
}

/** One product with onHand and its per-location breakdown, all from StockLedger. */
export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw notFound("Product not found");

  const stock = await getProductStock(id);
  return {
    ...withStockStatus(product, stock.total),
    stockByLocation: stock.locations,
  };
}

export async function updateProduct(id: string, data: ProductUpdateData) {
  try {
    await prisma.product.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw notFound("Product not found");
    }
    throw error;
  }
  return getProduct(id);
}
