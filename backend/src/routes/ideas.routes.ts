import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { initializeFirebaseAdmin, getFirestore } from '../utils/firebase-admin.js';
import admin from 'firebase-admin';

const router = Router();

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getFirestore();

// GET /api/v1/ideas - Get user's ideas
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const ideasRef = db.collection('ideas');
    const snapshot = await ideasRef
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const ideas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis(),
      updatedAt: doc.data().updatedAt?.toMillis(),
    }));

    res.json({ ideas });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/ideas/:id - Get specific idea
router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const ideaRef = db.collection('ideas').doc(req.params.id);
    const doc = await ideaRef.get();

    if (!doc.exists) {
      throw new AppError(404, 'Idée non trouvée', 'NOT_FOUND');
    }

    const idea = doc.data();
    if (idea?.userId !== req.user.uid && !idea?.isPublic) {
      throw new AppError(403, 'Accès non autorisé', 'FORBIDDEN');
    }

    res.json({
      id: doc.id,
      ...idea,
      createdAt: idea?.createdAt?.toMillis(),
      updatedAt: idea?.updatedAt?.toMillis(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/ideas - Create new idea
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const { title, brainDump, status = 'DRAFT' } = req.body;

    if (!title || !brainDump) {
      throw new AppError(400, 'Titre et brain dump sont requis', 'VALIDATION_ERROR');
    }

    const ideaData = {
      title,
      brainDump,
      status,
      userId: req.user.uid,
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
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/ideas/:id - Update idea
router.put('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const ideaRef = db.collection('ideas').doc(req.params.id);
    const doc = await ideaRef.get();

    if (!doc.exists) {
      throw new AppError(404, 'Idée non trouvée', 'NOT_FOUND');
    }

    if (doc.data()?.userId !== req.user.uid) {
      throw new AppError(403, 'Accès non autorisé', 'FORBIDDEN');
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
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/ideas/:id - Delete idea
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Utilisateur non authentifié', 'UNAUTHORIZED');
    }

    const ideaRef = db.collection('ideas').doc(req.params.id);
    const doc = await ideaRef.get();

    if (!doc.exists) {
      throw new AppError(404, 'Idée non trouvée', 'NOT_FOUND');
    }

    if (doc.data()?.userId !== req.user.uid) {
      throw new AppError(403, 'Accès non autorisé', 'FORBIDDEN');
    }

    await ideaRef.delete();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

