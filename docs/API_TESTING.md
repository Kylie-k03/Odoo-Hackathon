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

### Stock Ledger & Status (`/api/stock` & `/api/stock-ledger`)
- `GET /api/stock` - List global stock balances
- `GET /api/stock/:productId` - Get total stock for a specific product
- `GET /api/stock/:productId/:locationId` - Get stock for a specific product at a specific location
- `GET /api/stock-ledger` - List all append-only ledger entries

---

## Missing APIs (Dependencies)

The following core inventory operations are **not yet implemented** by the Backend Lead. They are documented here as missing dependencies:

1. **Delivery Orders (Outgoing)**: Missing routes and controllers to process dispatching stock to customers.
2. **Internal Transfers**: Missing routes and controllers to move stock from one internal warehouse location to another.
3. **Stock Adjustments**: Missing routes and controllers to perform manual stock delta corrections.
4. **Analytics**: No endpoints currently exist to aggregate movement trends or top moving products.

*Note: QA testing for these missing modules will commence immediately once the backend PRs are merged into `main`.*
