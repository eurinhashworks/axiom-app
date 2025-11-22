import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin, getFirestore } from './utils/firebase-admin.js';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// Helper function to verify auth token
async function verifyAuthToken(token: string) {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}

// Health check
export const health = functions.https.onRequest(async (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Get user's ideas
export const getIdeas = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const db = getFirestore();
    const ideasRef = db.collection('ideas');
    const snapshot = await ideasRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const ideas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis(),
      updatedAt: doc.data().updatedAt?.toMillis(),
    }));

    res.json({ ideas });
  } catch (error: any) {
    console.error('Error in getIdeas:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la récupération des idées' } });
  }
});

// Get specific idea
export const getIdeaById = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    // Extract idea ID from URL path
    const pathParts = req.path.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'ID d\'idée requis' } });
      return;
    }

    const db = getFirestore();
    const ideaRef = db.collection('ideas').doc(id);
    const doc = await ideaRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
      return;
    }

    const idea = doc.data();
    if (idea?.userId !== userId && !idea?.isPublic) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
      return;
    }

    res.json({
      id: doc.id,
      ...idea,
      createdAt: idea?.createdAt?.toMillis(),
      updatedAt: idea?.updatedAt?.toMillis(),
    });
  } catch (error: any) {
    console.error('Error in getIdeaById:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la récupération de l\'idée' } });
  }
});

// Create new idea
export const createIdea = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const { title, brainDump, status = 'DRAFT' } = req.body;

    if (!title || !brainDump) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Titre et brain dump sont requis' } });
      return;
    }

    const db = getFirestore();
    const ideaData = {
      title,
      brainDump,
      status,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isPublic: false,
    };

    const docRef = await db.collection('ideas').add(ideaData);
    const doc = await docRef.get();

    res.status(201).json({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toMillis(),
      updatedAt: doc.data()?.updatedAt?.toMillis(),
    });
  } catch (error: any) {
    console.error('Error in createIdea:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la création de l\'idée' } });
  }
});

// Update idea
export const updateIdea = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    // Extract idea ID from URL path
    const pathParts = req.path.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'ID d\'idée requis' } });
      return;
    }

    const ideaRef = getFirestore().collection('ideas').doc(id);
    const doc = await ideaRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
      return;
    }

    if (doc.data()?.userId !== userId) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
      return;
    }

    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    await ideaRef.update(updateData);
    const updatedDoc = await ideaRef.get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toMillis(),
      updatedAt: updatedDoc.data()?.updatedAt?.toMillis(),
    });
  } catch (error: any) {
    console.error('Error in updateIdea:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la mise à jour de l\'idée' } });
  }
});

// Delete idea
export const deleteIdea = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    // Extract idea ID from URL path
    const pathParts = req.path.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'ID d\'idée requis' } });
      return;
    }

    const ideaRef = getFirestore().collection('ideas').doc(id);
    const doc = await ideaRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
      return;
    }

    if (doc.data()?.userId !== userId) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
      return;
    }

    await ideaRef.delete();
    res.status(204).send();
  } catch (error: any) {
    console.error('Error in deleteIdea:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la suppression de l\'idée' } });
  }
});

// Analyze idea
export const analyzeIdea = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAuthToken(token);

    const { brainDump } = req.body;

    if (!brainDump) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Brain dump est requis' } });
      return;
    }

    // Use analyzeBrainDump function from gemini service
    const { analyzeBrainDump } = await import('./services/gemini/gemini.service.ts');

    // Perform analysis
    const analysis = await analyzeBrainDump(brainDump);

    // The new response format is the analysis object itself
    res.json(analysis);

  } catch (error: any) {
    console.error('Error in analyzeIdea:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de l\'analyse de l\'idée' } });
  }
});

// Evaluate idea
export const evaluateIdea = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const { ideaId, idea } = req.body;

    if (!idea) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Idée est requise' } });
      return;
    }

    // Evaluate with Gemini
    const { evaluateIdea: evaluateIdeaService } = await import('./services/gemini/gemini.service.js');
    const evaluation = await evaluateIdeaService(idea);

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
      const ideaRef = getFirestore().collection('ideas').doc(ideaId);
      const doc = await ideaRef.get();

      if (!doc.exists) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
        return;
      }

      if (doc.data()?.userId !== userId) {
        res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
        return;
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
  } catch (error: any) {
    console.error('Error in evaluateIdea:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de l\'évaluation de l\'idée' } });
  }
});

// Generate roadmap
export const generateRoadmap = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const { ideaId, idea } = req.body;

    if (!idea) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Idée est requise' } });
      return;
    }

    // Generate roadmap with Gemini
    const { generateRoadmap: generateRoadmapService } = await import('./services/gemini/gemini.service.js');
    const roadmapSteps = await generateRoadmapService(idea);

    // If ideaId is provided, update the idea
    if (ideaId) {
      const ideaRef = getFirestore().collection('ideas').doc(ideaId);
      const doc = await ideaRef.get();

      if (!doc.exists) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
        return;
      }

      if (doc.data()?.userId !== userId) {
        res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
        return;
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
  } catch (error: any) {
    console.error('Error in generateRoadmap:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la génération de la feuille de route' } });
  }
});

// Prioritize ideas
export const prioritizeIdeas = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAuthToken(token);

    const { ideas } = req.body;

    if (!ideas || !Array.isArray(ideas)) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Liste d\'idées est requise et doit être un tableau' } });
      return;
    }

    if (ideas.length < 2) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Au moins deux idées sont requises pour la priorisation' } });
      return;
    }

    // Prioritize with Gemini
    const geminiService = await import('./services/gemini/gemini.service.js') as any;
    const prioritization = await geminiService.prioritizeIdeas(ideas);

    res.json({ prioritization });
  } catch (error: any) {
    console.error('Error in prioritizeIdeas:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la priorisation des idées' } });
  }
});

// Get projects (placeholder)
export const getProjects = functions.https.onRequest(async (req, res) => {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token d\'authentification manquant' } });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAuthToken(token);

    res.json({ projects: [], message: 'Projects routes - Coming soon' });
  } catch (error: any) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la récupération des projets' } });
  }
});

// Export the main function
export const api = functions.https.onRequest(async (req, res) => {
  // Handle the routing manually based on the path
  const path = req.path;
  const method = req.method;

  // Health check
  if (path === '/health' && method === 'GET') {
    return health(req, res);
  }

  // Ideas routes
  if (path === '/api/v1/ideas' && method === 'GET') {
    return getIdeas(req, res);
  }
  if (path === '/api/v1/ideas' && method === 'POST') {
    return createIdea(req, res);
  }

  // Individual idea routes
  if (path.startsWith('/api/v1/ideas/') && method === 'GET') {
    return getIdeaById(req, res);
  }
  if (path.startsWith('/api/v1/ideas/') && method === 'PUT') {
    return updateIdea(req, res);
  }
  if (path.startsWith('/api/v1/ideas/') && method === 'DELETE') {
    return deleteIdea(req, res);
  }

  // Analysis routes
  if (path === '/api/v1/analysis/analyze' && method === 'POST') {
    return analyzeIdea(req, res);
  }
  if (path === '/api/v1/analysis/evaluate' && method === 'POST') {
    return evaluateIdea(req, res);
  }
  if (path === '/api/v1/analysis/generate-roadmap' && method === 'POST') {
    return generateRoadmap(req, res);
  }
  if (path === '/api/v1/analysis/prioritize' && method === 'POST') {
    return prioritizeIdeas(req, res);
  }

  // Projects routes
  if (path === '/api/v1/projects' && method === 'GET') {
    return getProjects(req, res);
  }

  // If no route matches, return 404
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route non trouvée' } });
});
