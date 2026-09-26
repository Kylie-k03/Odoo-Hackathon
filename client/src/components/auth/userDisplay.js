/**
 * Display helpers for the authenticated user. Role descriptions mirror the
 * backend RBAC rules (server/src/routes/*Routes.ts):
 *   - products create/edit and stock adjustments: ADMIN, WAREHOUSE_MANAGER
 *   - receipts, deliveries, internal transfers: ADMIN, WAREHOUSE_MANAGER, OPERATOR
 *   - all inventory reads: any signed-in user
 */

const ROLE_LABELS = {
  ADMIN: 'Admin',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  OPERATOR: 'Operator',
}

const ROLE_ACCESS = {
  ADMIN: 'Products, operations & adjustments',
  WAREHOUSE_MANAGER: 'Products, operations & adjustments',
  OPERATOR: 'Receipts, deliveries & transfers',
}

const ROLE_PERMISSIONS = {
  ADMIN:
    'You can create and edit products, record receipts, deliveries and internal transfers, post stock adjustments, and view all inventory data.',
  WAREHOUSE_MANAGER:
    'You can create and edit products, record receipts, deliveries and internal transfers, post stock adjustments, and view all inventory data.',
  OPERATOR:
    'You can record receipts, deliveries and internal transfers and view all inventory data. Creating or editing products and posting stock adjustments require an Admin or Warehouse Manager.',
}

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role ?? 'Unknown role'
}

export function roleAccess(role) {
  return ROLE_ACCESS[role] ?? 'Read-only inventory access'
}

export function rolePermissions(role) {
  return ROLE_PERMISSIONS[role] ?? 'You can view inventory data.'
}

export function userInitials(user) {
  const source = (user?.name || user?.email || '').trim()
  if (!source) return '?'
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)
  return letters.toUpperCase()
}
