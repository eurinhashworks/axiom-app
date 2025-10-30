import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { analyzeBrainDump, evaluateIdea } from '../services/gemini/gemini.service.js';
import { initializeFirebaseAdmin, getFirestore } from '../utils/firebase-admin.js';
import admin from 'firebase-admin';

const router = Router();

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getFirestore();

// POST /api/v1/analysis/analyze - Analyze brain dump
router.post('/analyze', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const { ideaId, brainDump } = req.body;

    if (!brainDump) {
      throw new AppError(400, 'Brain dump est requis', 'VALIDATION_ERROR');
    }

    // Analyze with Gemini
    const analysis = await analyzeBrainDump(brainDump);

    // If ideaId is provided, update the idea
    if (ideaId) {
      const ideaRef = db.collection('ideas').doc(ideaId);
      const doc = await ideaRef.get();

      if (!doc.exists) {
        throw new AppError(404, 'Idée non trouvée', 'NOT_FOUND');
      }

      if (doc.data()?.userId !== req.user.uid) {
        throw new AppError(403, 'Accès non autorisé', 'FORBIDDEN');
      }

      await ideaRef.update({
        analysis,
        status: 'ANALYZED',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/analysis/evaluate - Evaluate idea
router.post('/evaluate', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const { ideaId, idea } = req.body;

    if (!idea) {
      throw new AppError(400, 'Idée est requise', 'VALIDATION_ERROR');
    }

    // Evaluate with Gemini
    const evaluation = await evaluateIdea(idea);

    // Calculate scores
    const opportunityScore = (
      evaluation.problemUrgency +
      evaluation.targetMarketSize +
      evaluation.competitiveAdvantage
    ) / 3;

    const feasibilityScore = (
      evaluation.personalAlignment +
      evaluation.technicalFeasibility
    ) / 2;

    const evaluationData = {
      ...evaluation,
      opportunityScore: Math.round(opportunityScore * 10) / 10,
      feasibilityScore: Math.round(feasibilityScore * 10) / 10,
    };

    // If ideaId is provided, update the idea
    if (ideaId) {
      const ideaRef = db.collection('ideas').doc(ideaId);
      const doc = await ideaRef.get();

      if (!doc.exists) {
        throw new AppError(404, 'Idée non trouvée', 'NOT_FOUND');
      }

      if (doc.data()?.userId !== req.user.uid) {
        throw new AppError(403, 'Accès non autorisé', 'FORBIDDEN');
      }

      await ideaRef.update({
        evaluation: evaluationData,
        opportunityScore: evaluationData.opportunityScore,
        feasibilityScore: evaluationData.feasibilityScore,
        status: 'EVALUATED',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ evaluation: evaluationData });
  } catch (error) {
    next(error);
  }
});

export default router;
