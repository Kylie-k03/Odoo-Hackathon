# StockSense API Testing & Verification

## Currently Implemented APIs

The following endpoints have been discovered in the `server/src/routes/` directory and are ready for testing.

### Authentication (`/api/auth`)
- `POST /api/auth/register`
- `POST /api/auth/login`
- (Additional auth endpoints managed by Teammate 3)

### Products (`/api/products`)
- `GET /api/products` - List all products
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get specific product
- `PATCH /api/products/:id` - Update product details

### Locations (`/api/locations`)
- `GET /api/locations` - List all locations
- `POST /api/locations` - Create a new location

### Receipts (`/api/receipts`)
- `GET /api/receipts` - List all receipts
- `POST /api/receipts` - Create a new receipt (Incoming Stock)
- `GET /api/receipts/:id` - Get specific receipt details

### Deliveries (`/api/deliveries`)
- `GET /api/deliveries` - List all deliveries
- `POST /api/deliveries` - Create a new delivery order (Outgoing Stock)
- `GET /api/deliveries/:id` - Get specific delivery details

### Internal Transfers (`/api/transfers`)
- `GET /api/transfers` - List all transfers
- `POST /api/transfers` - Create a new internal transfer
- `GET /api/transfers/:id` - Get specific transfer details

### Stock Adjustments (`/api/adjustments`)
- `GET /api/adjustments` - List all adjustments
- `POST /api/adjustments` - Create a new manual stock adjustment (Requires Manager/Admin)
- `GET /api/adjustments/:id` - Get specific adjustment details

### Stock Ledger & Status (`/api/stock` & `/api/stock-ledger`)
- `GET /api/stock` - List global stock balances
- `GET /api/stock/:productId` - Get total stock for a specific product
- `GET /api/stock/:productId/:locationId` - Get stock for a specific product at a specific location
- `GET /api/stock-ledger` - List all append-only ledger entries

---

## Missing APIs (Dependencies)

The following core inventory operations are **not yet implemented**:

1. **Analytics**: No endpoints currently exist to aggregate movement trends or top moving products.

