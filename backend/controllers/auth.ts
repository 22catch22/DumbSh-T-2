
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dumb_shit_key';

// Extend Express Request interface to include user ID
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  id: string;
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token;

  // Check for token in Authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(410).json({ message: 'Not authorized, token missing' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Attach user ID to the request object
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};