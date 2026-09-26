# StockSense — Enterprise Inventory Management

> Built for the Odoo Hackathon 2026.

StockSense is an enterprise-grade, centralized inventory management platform inspired by Odoo's double-entry stock ledger architecture. It treats the stock ledger as an immutable single source of truth for all inventory movements.

---

## 🏛️ Architecture Overview

- **Frontend**: React (Vite SPA) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-Time**: Socket.io / WebSockets
- **Design System**: Enterprise SaaS Theme (Deep Navy, Action Teal, Alert Coral, Neutral Canvas)

---

## 📁 Repository Structure

```text
Odoo-Hackathon/
├── client/                 # React + Vite + Tailwind CSS frontend
├── server/                 # Node.js + Express + TypeScript backend
├── docker-compose.yml      # Multi-container orchestration (Postgres + Backend + Frontend)
├── Dockerfile.backend      # Container build for API server
├── Dockerfile.frontend     # Container build for Web client
├── package.json            # Root workspace orchestrator
└── README.md
```

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js (v20+ recommended, v24 supported)
- npm (v10+)
- PostgreSQL (or Docker for containerized setup)

### 1. Install Dependencies
```bash
# Installs root and workspace dependencies for both client and server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `server/` and `client/`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Run Development Server
```bash
# Starts both server (port 5000) and client (port 5173) concurrently
npm run dev
```

### 4. Health Check
- Backend API Health: `http://localhost:5000/api/health`
- Frontend Web App: `http://localhost:5173/`

---

## 🐳 Running with Docker Compose

```bash
docker compose up --build
```
- PostgreSQL: `localhost:5432`
- Backend API: `localhost:5000`
- Frontend UI: `localhost:3000`

---

## 🔒 Security & Contribution Rules
- All development remains on the `main` branch.
- No direct stock quantity manipulation: all inventory levels are calculated from immutable ledger transactions.
- Secrets must never be committed to Git.