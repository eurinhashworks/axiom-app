import { Request, Response, NextFunction } from 'express';
import { initializeFirebaseAdmin, getAuth } from '../utils/firebase-admin.js';
import { AppError } from './error.middleware.js';

// Initialize Firebase Admin
initializeFirebaseAdmin();

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token d\'authentification manquant', 'UNAUTHORIZED');
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      next();
    } catch (error) {
      throw new AppError(401, 'Token invalide ou expiré', 'INVALID_TOKEN');
    }
  } catch (error) {
    next(error);
  }
};

