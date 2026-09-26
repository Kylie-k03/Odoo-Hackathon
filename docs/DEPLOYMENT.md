# StockSense Deployment & Architecture

## Overview
The StockSense application runs as a multi-container Docker deployment orchestrated via `docker-compose.yml`.

### Architecture Flow
`Frontend Client (Nginx)` ↔ `Backend API (Express/Node)` ↔ `Database (PostgreSQL)`

## ⚠️ Important Build Target Note
- The Docker infrastructure is configured to build the **`client/`** directory as the production frontend.
- A parallel directory named **`frontend/`** currently holds the rich UI dashboard scaffolding. 
- **Action Required**: The frontend team must migrate/merge the UI from `frontend/` into the `client/` workspace, as `client/` is the active target integrated with the build pipeline and NPM workspaces.

## Prerequisites
- Docker & Docker Compose
- Node.js v20+ (for local workspace development)

## Local Development
The project utilizes `npm workspaces` to manage the monorepo.
To run the server and the scaffolded client concurrently:
```bash
npm install
npm run dev
```

## Docker Deployment
To spin up the entire stack (Database, Backend, Frontend):

1. Set up environment variables (copy `.env.example` to `.env` if available).
2. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```
3. Services:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`
   - **Database**: Port `5432`

## Troubleshooting
- **Database Connection Issues**: Ensure the backend container waits for Postgres to be fully initialized (`depends_on: db: condition: service_healthy` is utilized in `docker-compose.yml`).
- **Frontend Changes Not Reflecting**: Ensure you are modifying code inside `client/src` rather than the detached `frontend/` folder.
