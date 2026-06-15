import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from './errorHandler';

export const requireDbConnection = (req: Request, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    return next(new AppError('Database connection is currently unavailable. Please try again later.', 503));
  }
  next();
};
