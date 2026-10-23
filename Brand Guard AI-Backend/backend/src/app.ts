import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { ApiErrorResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive during local development & integration testing
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Body parser
app.use(express.json());

// API Routes
app.use('/api', routes);

// Production Frontend Static Asset Serving (Unified Full-Stack Architecture)
const candidateDistPaths = [
  process.env.FRONTEND_DIST_PATH,
  path.resolve(__dirname, '../../../Brandguard AI - Fe/frontend/dist'),
  path.resolve(__dirname, '../../../../Brandguard AI - Fe/frontend/dist'),
  path.resolve(process.cwd(), '../Brandguard AI - Fe/frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist/public'),
  path.resolve(__dirname, '../public')
].filter(Boolean) as string[];

const clientDistPath = candidateDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`[BrandGuard AI] Serving production frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for unhandled API endpoints
app.use((req: Request, res: Response) => {
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  };
  res.status(404).json(errorResponse);
});

// Centralized Error Handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred.'
    }
  };
  res.status(500).json(errorResponse);
});

export default app;
