# StockSense QA Test Cases

## PRODUCTS
- [ ] **TC-PROD-01**: Create product (Name: Steel Rods, SKU: RAW-STL-001, Unit: kg, Category: Raw Materials, Reorder Level: 25).
- [ ] **TC-PROD-02**: Update product details.
- [ ] **TC-PROD-03**: Retrieve product list and individual product details.
- [ ] **TC-PROD-04**: Invalid product validation (e.g., missing required fields like SKU or Name should fail).

## RECEIPTS
- [ ] **TC-REC-01**: Create receipt for incoming stock (e.g., 100 kg Steel Rods).
- [ ] **TC-REC-02**: Validate receipt status change (Draft -> Confirmed).
- [ ] **TC-REC-03**: Verify stock increases correctly in the destination location.
- [ ] **TC-REC-04**: Verify Stock Ledger entry is created with positive quantity.
- [ ] **TC-REC-05**: Invalid quantity rejected (cannot receive negative or zero quantities).

## DELIVERIES (Pending Backend Implementation)
- [ ] **TC-DEL-01**: Create delivery for outgoing stock.
- [ ] **TC-DEL-02**: Pick/pack/validate delivery.
- [ ] **TC-DEL-03**: Verify source stock decreases correctly.
- [ ] **TC-DEL-04**: Cannot deliver more than available stock (Validation rule).
- [ ] **TC-DEL-05**: Verify Stock Ledger entry is created with negative quantity.

## INTERNAL TRANSFERS (Pending Backend Implementation)
- [ ] **TC-TRN-01**: Transfer stock between two internal locations.
- [ ] **TC-TRN-02**: Verify source stock decreases by transferred amount.
- [ ] **TC-TRN-03**: Verify destination stock increases by transferred amount.
- [ ] **TC-TRN-04**: Verify total global stock for the product remains unchanged.
- [ ] **TC-TRN-05**: Verify TWO Stock Ledger entries are created (+ at dest, - at source).

## STOCK ADJUSTMENTS (Pending Backend Implementation)
- [ ] **TC-ADJ-01**: Positive stock adjustment.
- [ ] **TC-ADJ-02**: Negative stock adjustment (e.g., for damaged goods).
- [ ] **TC-ADJ-03**: Verify correct delta calculation is applied.
- [ ] **TC-ADJ-04**: Verify Stock Ledger entry is created for the adjustment delta.

## STOCK LEDGER
- [ ] **TC-LED-01**: Verify Receipt is recorded accurately.
- [ ] **TC-LED-02**: Verify Delivery is recorded accurately (Pending).
- [ ] **TC-LED-03**: Verify Internal Transfer is recorded accurately (Pending).
- [ ] **TC-LED-04**: Verify Adjustment is recorded accurately (Pending).
- [ ] **TC-LED-05**: Verify that stock-on-hand is perfectly derived by summing ledger entries for a specific product and location.

## AUTH
- [ ] **TC-AUTH-01**: User Registration.
- [ ] **TC-AUTH-02**: User Login and JWT token generation.
- [ ] **TC-AUTH-03**: Invalid credentials rejection.
- [ ] **TC-AUTH-04**: Verify protected routes require valid token.
- [ ] **TC-AUTH-05**: Password reset/OTP workflow (if fully integrated).

## RBAC (Pending Enforcement Implementation)
- [ ] **TC-RBAC-01**: Verify ADMIN / WAREHOUSE_MANAGER permissions (can adjust stock).
- [ ] **TC-RBAC-02**: Verify OPERATOR permissions (can view stock, but cannot perform unauthorized operations).
