"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebaseAdmin = initializeFirebaseAdmin;
exports.getFirestore = getFirestore;
exports.getAuth = getAuth;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Initialize Firebase Admin SDK
 * Supports both local file (development) and environment variables (production/Vercel)
 */
function initializeFirebaseAdmin() {
    // Don't reinitialize if already initialized
    if (firebase_admin_1.default.apps.length > 0) {
        return;
    }
    try {
        let credential;
        // Option 1: Use environment variable (production/Vercel)
        // Set FIREBASE_SERVICE_ACCOUNT to the JSON string of the service account
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                credential = firebase_admin_1.default.credential.cert(serviceAccount);
                console.log('✅ Firebase Admin initialisé avec variables d\'environnement');
            }
            catch (parseError) {
                console.error('❌ Erreur de parsing FIREBASE_SERVICE_ACCOUNT:', parseError);
                throw new Error('FIREBASE_SERVICE_ACCOUNT doit être un JSON valide');
            }
        }
        // Option 2: Use individual environment variables (alternative approach)
        else if (process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PRIVATE_KEY &&
            process.env.FIREBASE_CLIENT_EMAIL) {
            credential = firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            });
            console.log('✅ Firebase Admin initialisé avec variables d\'environnement individuelles');
        }
        // Option 3: Use local file (development)
        else {
            try {
                const serviceAccountPath = (0, path_1.join)(process.cwd(), 'firebase-service-account.json');
                const serviceAccount = JSON.parse((0, fs_1.readFileSync)(serviceAccountPath, 'utf8'));
                credential = firebase_admin_1.default.credential.cert(serviceAccount);
                console.log('✅ Firebase Admin initialisé avec fichier local firebase-service-account.json');
            }
            catch (fileError) {
                if (fileError.code === 'ENOENT') {
                    throw new Error('Firebase Admin non initialisé: Aucune configuration trouvée.\n' +
                        'En développement: Ajoutez firebase-service-account.json dans functions/\n' +
                        'En production: Définissez FIREBASE_SERVICE_ACCOUNT ou les variables individuelles dans les variables d\'environnement');
                }
                throw fileError;
            }
        }
        firebase_admin_1.default.initializeApp({
            credential,
        });
    }
    catch (error) {
        console.error('❌ Erreur d\'initialisation Firebase Admin:', error);
        throw error;
    }
}
/**
 * Get Firestore instance (ensures Firebase is initialized)
 */
function getFirestore() {
    if (!firebase_admin_1.default.apps.length) {
        initializeFirebaseAdmin();
    }
    return firebase_admin_1.default.firestore();
}
/**
 * Get Auth instance (ensures Firebase is initialized)
 */
function getAuth() {
    if (!firebase_admin_1.default.apps.length) {
        initializeFirebaseAdmin();
    }
    return firebase_admin_1.default.auth();
}
//# sourceMappingURL=firebase-admin.js.map