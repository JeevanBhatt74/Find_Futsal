import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/database';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';

// ─── Application Instance ─────────────────────────────────────────────────────

const app: Application = express();
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// ─── CORS Configuration ───────────────────────────────────────────────────────

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ─── Security Headers ─────────────────────────────────────────────────────────

app.use(helmet());

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'rate_limit_exceeded',
    message: 'Too many requests from this IP. Please try again later.',
  },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'rate_limit_exceeded',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);

// ─── Request Parsing ──────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────

if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
import authRouter from './routes/auth';
import venueRouter from './routes/venues';
import slotRouter from './routes/slots';
import bookingRouter from './routes/bookings';
import initLockCleanupCron from './cron/lockCleanup';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/venues', venueRouter);
app.use('/api/v1/slots', slotRouter);
app.use('/api/v1/bookings', bookingRouter);

app.get('/api/v1', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '⚽ FindFutsal API v1 — Ready',
    version: '1.0.0',
    docs: '/api/v1/docs',
  });
});

// ─── Error Handling (must be last) ────────────────────────────────────────────

app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Start background cron scheduler to automatically release expired locks
    initLockCleanupCron();

    app.listen(PORT, () => {
      console.log('');
      console.log('  ⚽  FindFutsal API Server');
      console.log('  ─────────────────────────────────────────');
      console.log(`  🚀  Running on:    http://localhost:${PORT}`);
      console.log(`  🌍  Environment:   ${NODE_ENV}`);
      console.log(`  💓  Health check:  http://localhost:${PORT}/health`);
      console.log('  ─────────────────────────────────────────');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Catch unhandled rejections globally
process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

void startServer();

export default app;
