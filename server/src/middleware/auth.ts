import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db, UserDoc } from '../db/inMemoryStore.js';

export interface AuthenticatedRequest extends Request {
  user?: UserDoc;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to proceed.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; role: string };
    const user = db.users.find(u => u._id === decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please sign in again.',
      code: 'INVALID_TOKEN',
    });
  }
};

export const authorize = (...roles: Array<'CUSTOMER' | 'PROVIDER' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user?.role || 'Unknown'}' is not authorized.`,
        code: 'FORBIDDEN',
      });
      return;
    }
    next();
  };
};
