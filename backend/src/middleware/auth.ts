import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import User, { IUser } from '../models/User';

// ─── Extend Express Request Interface ─────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Protect middleware: Ensures the request is authenticated with a valid JWT.
 * Attaches the authenticated user model to req.user.
 */
export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1) Retrieve the token from Authorization header (Bearer <token>)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError(
          'Access denied. You are not logged in. Please provide a valid authentication token.',
          401
        )
      );
    }

    // 2) Validate the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? 'super_secret_session_key_for_find_futsal_web_app_development_2026'
    ) as DecodedToken;

    // 3) Verify if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this session token no longer exists.',
          401
        )
      );
    }

    // 4) Check if the user is active
    if (!currentUser.isActive) {
      return next(
        new AppError(
          'This user account is currently deactivated. Please contact support.',
          403
        )
      );
    }

    // 5) Allow access: Attach user to the request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(error); // This will bubble up to the global error handler which natively parses JsonWebTokenError and TokenExpiredError
  }
};

/**
 * Restrict middleware: Ensures the user has one of the specified roles.
 * Must be used AFTER protect middleware.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
