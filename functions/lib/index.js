"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.getProjects = exports.prioritizeIdeas = exports.generateRoadmap = exports.evaluateIdea = exports.analyzeIdea = exports.deleteIdea = exports.updateIdea = exports.createIdea = exports.getIdeaById = exports.getIdeas = exports.health = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_admin_js_1 = require("./utils/firebase-admin.js");
const auth_1 = require("firebase-admin/auth");
// Initialize Firebase Admin SDK
(0, firebase_admin_js_1.initializeFirebaseAdmin)();
// Helper function to verify auth token
async function verifyAuthToken(token) {
    try {
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(token);
        return decodedToken;
    }
    catch (error) {
        throw new Error('Token invalide ou expiré');
    }
}
// Health check
exports.health = functions.https.onRequest(async (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
// Get user's ideas
exports.getIdeas = functions.https.onRequest(async (req, res) => {
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
        const db = (0, firebase_admin_js_1.getFirestore)();
        const ideasRef = db.collection('ideas');
        const snapshot = await ideasRef
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        const ideas = snapshot.docs.map(doc => {
            var _a, _b;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toMillis(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toMillis() }));
        });
        res.json({ ideas });
    }
    catch (error) {
        console.error('Error in getIdeas:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la récupération des idées' } });
    }
});
// Get specific idea
exports.getIdeaById = functions.https.onRequest(async (req, res) => {
    var _a, _b;
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
        const db = (0, firebase_admin_js_1.getFirestore)();
        const ideaRef = db.collection('ideas').doc(id);
        const doc = await ideaRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
            return;
        }
        const idea = doc.data();
        if ((idea === null || idea === void 0 ? void 0 : idea.userId) !== userId && !(idea === null || idea === void 0 ? void 0 : idea.isPublic)) {
            res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
            return;
        }
        res.json(Object.assign(Object.assign({ id: doc.id }, idea), { createdAt: (_a = idea === null || idea === void 0 ? void 0 : idea.createdAt) === null || _a === void 0 ? void 0 : _a.toMillis(), updatedAt: (_b = idea === null || idea === void 0 ? void 0 : idea.updatedAt) === null || _b === void 0 ? void 0 : _b.toMillis() }));
    }
    catch (error) {
        console.error('Error in getIdeaById:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la récupération de l\'idée' } });
    }
});
// Create new idea
exports.createIdea = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
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
        const db = (0, firebase_admin_js_1.getFirestore)();
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
        res.status(201).json(Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_b = (_a = doc.data()) === null || _a === void 0 ? void 0 : _a.createdAt) === null || _b === void 0 ? void 0 : _b.toMillis(), updatedAt: (_d = (_c = doc.data()) === null || _c === void 0 ? void 0 : _c.updatedAt) === null || _d === void 0 ? void 0 : _d.toMillis() }));
    }
    catch (error) {
        console.error('Error in createIdea:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la création de l\'idée' } });
    }
});
// Update idea
exports.updateIdea = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d, _e;
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
        const ideaRef = (0, firebase_admin_js_1.getFirestore)().collection('ideas').doc(id);
        const doc = await ideaRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
            return;
        }
        if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
            res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
            return;
        }
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        // Remove undefined values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        await ideaRef.update(updateData);
        const updatedDoc = await ideaRef.get();
        res.json(Object.assign(Object.assign({ id: updatedDoc.id }, updatedDoc.data()), { createdAt: (_c = (_b = updatedDoc.data()) === null || _b === void 0 ? void 0 : _b.createdAt) === null || _c === void 0 ? void 0 : _c.toMillis(), updatedAt: (_e = (_d = updatedDoc.data()) === null || _d === void 0 ? void 0 : _d.updatedAt) === null || _e === void 0 ? void 0 : _e.toMillis() }));
    }
    catch (error) {
        console.error('Error in updateIdea:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la mise à jour de l\'idée' } });
    }
});
// Delete idea
exports.deleteIdea = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const ideaRef = (0, firebase_admin_js_1.getFirestore)().collection('ideas').doc(id);
        const doc = await ideaRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
            return;
        }
        if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
            res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
            return;
        }
        await ideaRef.delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error in deleteIdea:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la suppression de l\'idée' } });
    }
});
// Analyze idea
exports.analyzeIdea = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const { ideaId, brainDump } = req.body;
        if (!brainDump) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Brain dump est requis' } });
            return;
        }
        // Use analyzeBrainDump function from gemini service
        const { analyzeBrainDump } = await Promise.resolve().then(() => __importStar(require('./services/gemini/gemini.service.js')));
        // Perform basic analysis
        const analysis = await analyzeBrainDump(brainDump);
        // If ideaId is provided, update the idea
        if (ideaId) {
            const ideaRef = (0, firebase_admin_js_1.getFirestore)().collection('ideas').doc(ideaId);
            const doc = await ideaRef.get();
            if (!doc.exists) {
                res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
                return;
            }
            if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
                res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès non autorisé' } });
                return;
            }
            await ideaRef.update({
                analysis,
                status: 'ANALYZED',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        res.json({ analysis });
    }
    catch (error) {
        console.error('Error in analyzeIdea:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de l\'analyse de l\'idée' } });
    }
});
// Evaluate idea
exports.evaluateIdea = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const { evaluateIdea: evaluateIdeaService } = await Promise.resolve().then(() => __importStar(require('./services/gemini/gemini.service.js')));
        const evaluation = await evaluateIdeaService(idea);
        // Calculate scores
        const opportunityScore = (evaluation.problemUrgency +
            evaluation.targetMarketSize +
            evaluation.competitiveAdvantage) / 3;
        const feasibilityScore = (evaluation.personalAlignment +
            evaluation.technicalFeasibility) / 2;
        const evaluationData = Object.assign(Object.assign({}, evaluation), { opportunityScore: Math.round(opportunityScore * 10) / 10, feasibilityScore: Math.round(feasibilityScore * 10) / 10 });
        // If ideaId is provided, update the idea
        if (ideaId) {
            const ideaRef = (0, firebase_admin_js_1.getFirestore)().collection('ideas').doc(ideaId);
            const doc = await ideaRef.get();
            if (!doc.exists) {
                res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
                return;
            }
            if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
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
    }
    catch (error) {
        console.error('Error in evaluateIdea:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de l\'évaluation de l\'idée' } });
    }
});
// Generate roadmap
exports.generateRoadmap = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const { generateRoadmap: generateRoadmapService } = await Promise.resolve().then(() => __importStar(require('./services/gemini/gemini.service.js')));
        const roadmapSteps = await generateRoadmapService(idea);
        // If ideaId is provided, update the idea
        if (ideaId) {
            const ideaRef = (0, firebase_admin_js_1.getFirestore)().collection('ideas').doc(ideaId);
            const doc = await ideaRef.get();
            if (!doc.exists) {
                res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Idée non trouvée' } });
                return;
            }
            if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
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
    }
    catch (error) {
        console.error('Error in generateRoadmap:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la génération de la feuille de route' } });
    }
});
// Prioritize ideas
exports.prioritizeIdeas = functions.https.onRequest(async (req, res) => {
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
        const geminiService = await Promise.resolve().then(() => __importStar(require('./services/gemini/gemini.service.js')));
        const prioritization = await geminiService.prioritizeIdeas(ideas);
        res.json({ prioritization });
    }
    catch (error) {
        console.error('Error in prioritizeIdeas:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la priorisation des idées' } });
    }
});
// Get projects (placeholder)
exports.getProjects = functions.https.onRequest(async (req, res) => {
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
    }
    catch (error) {
        console.error('Error in getProjects:', error);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erreur lors de la récupération des projets' } });
    }
});
// Export the main function
exports.api = functions.https.onRequest(async (req, res) => {
    // Handle the routing manually based on the path
    const path = req.path;
    const method = req.method;
    // Health check
    if (path === '/health' && method === 'GET') {
        return (0, exports.health)(req, res);
    }
    // Ideas routes
    if (path === '/api/v1/ideas' && method === 'GET') {
        return (0, exports.getIdeas)(req, res);
    }
    if (path === '/api/v1/ideas' && method === 'POST') {
        return (0, exports.createIdea)(req, res);
    }
    // Individual idea routes
    if (path.startsWith('/api/v1/ideas/') && method === 'GET') {
        return (0, exports.getIdeaById)(req, res);
    }
    if (path.startsWith('/api/v1/ideas/') && method === 'PUT') {
        return (0, exports.updateIdea)(req, res);
    }
    if (path.startsWith('/api/v1/ideas/') && method === 'DELETE') {
        return (0, exports.deleteIdea)(req, res);
    }
    // Analysis routes
    if (path === '/api/v1/analysis/analyze' && method === 'POST') {
        return (0, exports.analyzeIdea)(req, res);
    }
    if (path === '/api/v1/analysis/evaluate' && method === 'POST') {
        return (0, exports.evaluateIdea)(req, res);
    }
    if (path === '/api/v1/analysis/generate-roadmap' && method === 'POST') {
        return (0, exports.generateRoadmap)(req, res);
    }
    if (path === '/api/v1/analysis/prioritize' && method === 'POST') {
        return (0, exports.prioritizeIdeas)(req, res);
    }
    // Projects routes
    if (path === '/api/v1/projects' && method === 'GET') {
        return (0, exports.getProjects)(req, res);
    }
    // If no route matches, return 404
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route non trouvée' } });
});
//# sourceMappingURL=index.js.map