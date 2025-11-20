import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { analyzeBrainDump, evaluateIdea, generateRoadmap, prioritizeIdeas } from '../services/gemini/gemini.service.js';
import { analyzeBrainDumpEnhanced } from '../services/gemini/enhanced-analysis.service.js';
import { initializeFirebaseAdmin, getFirestore } from '../utils/firebase-admin.js';
import admin from 'firebase-admin';

const router = Router();

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getFirestore();

// POST /api/v1/analysis/analyze - Analyze brain dump (enhanced with SWOT, web research, Go/No-Go)
router.post('/analyze', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const { ideaId, brainDump, title, enhanced = true } = req.body;

    if (!brainDump) {
      throw new AppError(400, 'Brain dump est requis', 'VALIDATION_ERROR');
    }

    // Use enhanced analysis if enabled (default) or fallback to basic analysis
    let analysis, swotAnalysis, webResearch, competitiveAnalysis, goNoGo;

    if (enhanced) {
      try {
        const enhancedResult = await analyzeBrainDumpEnhanced(brainDump, title);
        analysis = enhancedResult.analysis;
        swotAnalysis = enhancedResult.swotAnalysis;
        webResearch = enhancedResult.webResearch;
        competitiveAnalysis = enhancedResult.competitiveAnalysis;
        goNoGo = enhancedResult.goNoGo;
      } catch (enhancedError: any) {
        // Fallback to basic analysis if enhanced fails
        console.warn('Enhanced analysis failed, falling back to basic analysis:', enhancedError.message);
        analysis = await analyzeBrainDump(brainDump);
        swotAnalysis = undefined;
        webResearch = undefined;
        competitiveAnalysis = undefined;
        goNoGo = undefined;
      }
    } else {
      // Basic analysis only
      analysis = await analyzeBrainDump(brainDump);
    }

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

      const updateData: any = {
        analysis,
        status: 'ANALYZED',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Add enhanced data if available
      if (swotAnalysis) updateData.swotAnalysis = swotAnalysis;
      if (webResearch) updateData.webResearch = webResearch;
      if (competitiveAnalysis) updateData.competitiveAnalysis = competitiveAnalysis;
      if (goNoGo) updateData.goNoGo = goNoGo;

      await ideaRef.update(updateData);
    }

    // Return response with all data
    const response: any = { analysis };
    if (swotAnalysis) response.swotAnalysis = swotAnalysis;
    if (webResearch) response.webResearch = webResearch;
    if (competitiveAnalysis) response.competitiveAnalysis = competitiveAnalysis;
    if (goNoGo) response.goNoGo = goNoGo;

    res.json(response);
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

// POST /api/v1/analysis/generate-roadmap - Generate roadmap for an idea
router.post('/generate-roadmap', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const { ideaId, idea } = req.body;

    if (!idea) {
      throw new AppError(400, 'Idée est requise', 'VALIDATION_ERROR');
    }

    // Generate roadmap with Gemini
    const roadmapSteps = await generateRoadmap(idea);

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

      // Convert string array to RoadmapStep format
      const roadmapStepsFormatted = roadmapSteps.map(step => ({ text: step, completed: false }));

      await ideaRef.update({
        roadmapSteps: roadmapStepsFormatted,
        status: 'ROADMAP_GENERATED',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ roadmapSteps });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/analysis/prioritize - Prioritize multiple ideas
router.post('/prioritize', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const { ideas } = req.body;

    if (!ideas || !Array.isArray(ideas)) {
      throw new AppError(400, 'Liste d\'idées est requise et doit être un tableau', 'VALIDATION_ERROR');
    }

    if (ideas.length < 2) {
      throw new AppError(400, 'Au moins deux idées sont requises pour la priorisation', 'VALIDATION_ERROR');
    }

    // Prioritize with Gemini
    const prioritization = await prioritizeIdeas(ideas);

    res.json({ prioritization });
  } catch (error) {
    next(error);
  }
});

export default router;
