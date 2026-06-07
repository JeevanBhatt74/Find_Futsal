import { Request, Response, NextFunction } from 'express';

// ─── Custom Error Class ────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes known errors from unknown bugs
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 404 Handler ──────────────────────────────────────────────────────────────

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// ─── Global Error Handler ─────────────────────────────────────────────────────

export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const isOperational = isAppError ? err.isOperational : false;

  // Log non-operational errors (programming bugs) verbosely
  if (!isOperational) {
    console.error('💥 UNHANDLED ERROR:', err);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      status: 'validation_error',
      message: err.message,
    });
    return;
  }

  // Mongoose Duplicate Key Error (code 11000)
  if ('code' in err && (err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({
      success: false,
      status: 'duplicate_error',
      message: 'A resource with that value already exists.',
    });
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      status: 'auth_error',
      message: 'Invalid authentication token.',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      status: 'auth_error',
      message: 'Your session has expired. Please log in again.',
    });
    return;
  }

  // Generic fallback
  res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? 'server_error' : 'error',
    message: isOperational
      ? err.message
      : 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
