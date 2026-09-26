-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('INTERNAL', 'INPUT', 'OUTPUT', 'SUPPLIER', 'CUSTOMER', 'SCRAP');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'INTERNAL',
    "warehouseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'units',
    "costPrice" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "reorderLevel" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_operations" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceLocationId" TEXT,
    "destinationLocationId" TEXT,
    "createdById" TEXT,
    "notes" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_operation_lines" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL DEFAULT 0,

    CONSTRAINT "stock_operation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_ledger" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "reference" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "locations_type_idx" ON "locations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "locations_warehouseId_code_key" ON "locations"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE UNIQUE INDEX "stock_operations_reference_key" ON "stock_operations"("reference");

-- CreateIndex
CREATE INDEX "stock_operations_operationType_idx" ON "stock_operations"("operationType");

-- CreateIndex
CREATE INDEX "stock_operations_status_idx" ON "stock_operations"("status");

-- CreateIndex
CREATE INDEX "stock_operations_createdAt_idx" ON "stock_operations"("createdAt");

-- CreateIndex
CREATE INDEX "stock_operation_lines_operationId_idx" ON "stock_operation_lines"("operationId");

-- CreateIndex
CREATE INDEX "stock_operation_lines_productId_idx" ON "stock_operation_lines"("productId");

-- CreateIndex
CREATE INDEX "stock_ledger_productId_locationId_idx" ON "stock_ledger"("productId", "locationId");

-- CreateIndex
CREATE INDEX "stock_ledger_productId_createdAt_idx" ON "stock_ledger"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "stock_ledger_operationId_idx" ON "stock_ledger"("operationId");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_operations" ADD CONSTRAINT "stock_operations_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_operations" ADD CONSTRAINT "stock_operations_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_operations" ADD CONSTRAINT "stock_operations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_operation_lines" ADD CONSTRAINT "stock_operation_lines_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "stock_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_operation_lines" ADD CONSTRAINT "stock_operation_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "stock_operations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
