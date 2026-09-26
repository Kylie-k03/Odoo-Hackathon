# StockSense — Enterprise Inventory Management System

> Built for the Odoo Hackathon 2026.

StockSense is a modular, real-time Inventory Management System designed for the Odoo Hackathon. It streamlines stock operations across warehouses with a single, auditable source of truth: the **Stock Ledger**.

---

## 🏛️ Repository Architecture

The project is structured for 4-person parallel team execution:

- `/frontend` - React + Vite + Tailwind CSS UI Console & Warehouse Views (Member 1 Lead)
- `/backend/core` - REST API & PostgreSQL Stock Ledger Transaction Engine (Member 2 Lead)
- `/backend/auth` & `/backend/realtime` - Authentication, RBAC & Live Alert WebSockets (Member 3 Lead)
- `/tests` & `/docs` - Validation, worked examples and delivery documentation (Member 4 Lead)

The system is designed around an immutable stock ledger so inventory movements remain auditable.

---

## 💻 Frontend Development

The frontend console is built with:

- **React**
- **Vite**
- **Tailwind CSS v4**
- **React Router v7**
- **Lucide React**
- **Recharts**

### Prerequisites

- **Node.js**: v18+ (tested on v22.x)
- **npm**: v9+ (tested on v10.x)

### Quickstart

1. Navigate to the frontend:

```bash
cd frontend