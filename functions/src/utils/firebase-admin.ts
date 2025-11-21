import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Initialize Firebase Admin SDK
 * Supports both local file (development) and environment variables (production/Vercel)
 */
export function initializeFirebaseAdmin(): void {
  // Don't reinitialize if already initialized
  if (admin.apps.length > 0) {
    return;
  }

  try {
    let credential;

    // Option 1: Use environment variable (production/Vercel)
    // Set FIREBASE_SERVICE_ACCOUNT to the JSON string of the service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = admin.credential.cert(serviceAccount);
        console.log('✅ Firebase Admin initialisé avec variables d\'environnement');
      } catch (parseError) {
        console.error('❌ Erreur de parsing FIREBASE_SERVICE_ACCOUNT:', parseError);
        throw new Error('FIREBASE_SERVICE_ACCOUNT doit être un JSON valide');
      }
    }
    // Option 2: Use individual environment variables (alternative approach)
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      });
      console.log('✅ Firebase Admin initialisé avec variables d\'environnement individuelles');
    }
    // Option 3: Use local file (development)
    else {
      try {
        const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        credential = admin.credential.cert(serviceAccount);
        console.log('✅ Firebase Admin initialisé avec fichier local firebase-service-account.json');
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          throw new Error(
            'Firebase Admin non initialisé: Aucune configuration trouvée.\n' +
            'En développement: Ajoutez firebase-service-account.json dans functions/\n' +
            'En production: Définissez FIREBASE_SERVICE_ACCOUNT ou les variables individuelles dans les variables d\'environnement'
          );
        }
        throw fileError;
      }
    }

    admin.initializeApp({
      credential,
    });
  } catch (error) {
    console.error('❌ Erreur d\'initialisation Firebase Admin:', error);
    throw error;
  }
}

/**
 * Get Firestore instance (ensures Firebase is initialized)
 */
export function getFirestore() {
  if (!admin.apps.length) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
}

/**
 * Get Auth instance (ensures Firebase is initialized)
 */
export function getAuth() {
  if (!admin.apps.length) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
}