import { PrismaClient, LocationType, OperationType, OperationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting QA Seed...');

  // 1. Create or Find Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      code: 'WH-MAIN',
      name: 'Main Warehouse',
      address: '123 Hackathon Ave',
    },
  });
  console.log(`✅ Warehouse: ${warehouse.name}`);

  // 2. Create Required Locations for the Steel Rod Flow
  const vendorLocation = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: warehouse.id, code: 'LOC-VENDOR' } },
    update: {},
    create: {
      code: 'LOC-VENDOR',
      name: 'Vendor Location',
      type: LocationType.SUPPLIER,
      warehouseId: warehouse.id,
    },
  });
  
  const mainStoreLocation = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: warehouse.id, code: 'LOC-MAIN' } },
    update: {},
    create: {
      code: 'LOC-MAIN',
      name: 'Main Store',
      type: LocationType.INTERNAL,
      warehouseId: warehouse.id,
    },
  });

  const productionRack = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: warehouse.id, code: 'LOC-PROD' } },
    update: {},
    create: {
      code: 'LOC-PROD',
      name: 'Production Rack',
      type: LocationType.INTERNAL,
      warehouseId: warehouse.id,
    },
  });
  console.log(`✅ Locations initialized (Vendor, Main Store, Production Rack)`);

  // 3. Create Steel Rods Product
  const product = await prisma.product.upsert({
    where: { sku: 'RAW-STL-001' },
    update: {},
    create: {
      name: 'Steel Rods',
      sku: 'RAW-STL-001',
      unitOfMeasure: 'kg',
      category: 'Raw Materials',
      reorderLevel: 25.00,
    },
  });
  console.log(`✅ Product: ${product.name} (${product.sku}) created`);

  // We stop here because the actual receipt and delivery operations 
  // should be tested via the API (Receipt +100, Transfer, etc) 
  // to ensure the Ledger logic in the Service layer is triggered correctly.
  
  console.log('🎉 QA Seed Complete. Ready for API testing.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
