# StockSense QA & Testing Approach

## QA Philosophy
Our QA focuses on ensuring the **Stock Ledger** acts as the single source of truth for all inventory operations. No manual edits to stock quantities are allowed outside of strictly recorded operational entries (Receipt, Delivery, Transfer, Adjustment). 

## Primary Integration Scenario: The "Steel Rod" Flow
This scenario validates the double-entry inventory engine end-to-end. 

### Prerequisites
- Create Product: **Steel Rods** (SKU: `RAW-STL-001`, Unit: `kg`)
- Create/Identify Locations: `Main Store` (INTERNAL), `Production Rack` (INTERNAL), `Vendor` (SUPPLIER), `Client` (CUSTOMER), `Scrap` (SCRAP)

### Execution Steps
1. **Receipt**: Receive 100 kg Steel Rod from the Vendor to `Main Store`.
   - *Expected Result*: `Main Store` stock = 100 kg. Global stock = 100 kg.
2. **Internal Transfer**: Move 100 kg from `Main Store` to `Production Rack`.
   - *Expected Result*: `Main Store` stock = 0 kg. `Production Rack` stock = 100 kg. Global stock remains 100 kg. TWO ledger entries are generated.
3. **Delivery**: Deliver 20 kg of Steel Rod from `Production Rack` to the Client.
   - *Expected Result*: `Production Rack` stock = 80 kg. Global stock = 80 kg.
4. **Adjustment**: Record 3 kg of Steel Rod as damaged/missing from `Production Rack`.
   - *Expected Result*: `Production Rack` stock = 77 kg. Global stock = 77 kg.
5. **Ledger Verification**: Open the Stock Ledger and verify all operations are chronologically recorded. The sum of all entries for `Production Rack` must equal exactly 77.

## Known Issues & Missing Features
- **Missing Core Operations**: Delivery, Internal Transfer, and Adjustment APIs are currently pending implementation by the backend team. The Steel Rod flow can only be partially executed (Receipt phase) at this time.
- **Frontend Divergence**: The active `client/` frontend is currently a scaffold. The actual UI needs to be merged from the `frontend/` directory before end-to-end UI testing can commence.
- **Analytics**: Pending stable operations and ledger data.
