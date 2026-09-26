import authRoutes from "./routes/authRoutes";
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './prisma';
import locationRoutes from './routes/locationRoutes';
import productRoutes from './routes/productRoutes';
import stockRoutes from './routes/stockRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use("/api/auth", authRoutes);

// Health endpoint with database connectivity probe
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1500));
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: 'ok',
    service: 'StockSense Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  });
});

// Inventory routes
app.use('/api', locationRoutes);
app.use('/api', productRoutes);
app.use('/api', stockRoutes);

// 404 handler for undefined routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// Error handler — must be registered last
app.use(errorHandler);

export default app;
