import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

// Placeholder for projects routes (to be implemented)
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    res.json({ projects: [], message: 'Projects routes - Coming soon' });
  } catch (error) {
    next(error);
  }
});

export default router;

