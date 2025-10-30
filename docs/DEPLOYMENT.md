# Guide de Déploiement sur Vercel

Ce projet est un **monorepo** avec un frontend (React + Vite) et un backend (Node.js + Express). Vous pouvez déployer les deux dans le **même repository GitHub**.

## 🎯 Option 1 : Deux Projets Vercel (RECOMMANDÉ)

Cette approche permet de gérer le frontend et le backend séparément avec leurs propres configurations.

### Configuration Frontend

1. **Créez un nouveau projet Vercel** (Frontend) :
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "New Project"
   - Importez votre repository GitHub
   - **Root Directory** : Laissez vide (racine du repo)

2. **Configurez le projet** :
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

3. **Variables d'environnement** :
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Déployez** : Vercel détectera automatiquement la configuration dans `vercel.json`

### Configuration Backend

1. **Créez un deuxième projet Vercel** (Backend) :
   - Cliquez sur "New Project" à nouveau
   - Importez le **même repository GitHub**
   - **Root Directory** : `backend` (IMPORTANT !)

2. **Configurez le projet** :
   - **Framework Preset** : Other
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`
   - **Install Directory** : `backend`

3. **Créer `backend/api/index.ts`** (déjà créé) :
   ```typescript
   import app from '../src/index.js';
   export default app;
   ```

4. **Variables d'environnement** :
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=https://votre-frontend.vercel.app
   PORT=3000
   NODE_ENV=production
   ```

5. **Déployez** : Vercel utilisera le fichier `backend/vercel.json`

### Mise à jour du Frontend

Après le déploiement du backend, mettez à jour le frontend pour pointer vers l'URL du backend :

Dans `services/apiClient.ts` ou votre configuration :
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://votre-backend.vercel.app';
```

Ajoutez `VITE_API_URL` dans les variables d'environnement du frontend Vercel.

## 🎯 Option 2 : Projet Unique (Fonctions Serverless)

Cette approche utilise les fonctions serverless de Vercel pour le backend.

### Configuration

1. **Créer `api/index.ts`** à la racine :
   ```typescript
   import app from '../backend/src/index.js';
   export default app;
   ```

2. **Modifier `vercel.json`** :
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build"
       },
       {
         "src": "api/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/api/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

3. **Variables d'environnement** : Toutes dans un seul projet

## 📋 Checklist de Déploiement

### Frontend
- [ ] Créer projet Vercel (Root: `/`)
- [ ] Configurer variables d'environnement Firebase (VITE_*)
- [ ] Configurer `VITE_API_URL` pointant vers le backend
- [ ] Déployer

### Backend
- [ ] Créer projet Vercel (Root: `/backend`)
- [ ] Configurer `FIREBASE_SERVICE_ACCOUNT` (JSON complet)
- [ ] Configurer `GEMINI_API_KEY`
- [ ] Configurer `FRONTEND_URL` (URL du frontend)
- [ ] Déployer

## 🔗 URLs

Après déploiement :
- **Frontend** : `https://votre-frontend.vercel.app`
- **Backend** : `https://votre-backend.vercel.app`

## 🔧 Configuration CORS

Le backend doit autoriser le frontend dans `src/index.ts` :
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## 📝 Notes Importantes

1. **`firebase-service-account.json`** ne doit JAMAIS être commité (déjà dans `.gitignore`)
2. Utilisez les variables d'environnement en production
3. Les deux projets peuvent être dans le même repo GitHub
4. Chaque projet Vercel a son propre domaine/URL
5. Les variables d'environnement sont séparées par projet

## 🐛 Dépannage

### Backend ne démarre pas
- Vérifiez que `FIREBASE_SERVICE_ACCOUNT` est un JSON valide
- Vérifiez que toutes les variables sont définies

### Erreur CORS
- Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL réelle du frontend
- Ajoutez `https://` dans l'URL si nécessaire

### Erreur de build
- Vérifiez que le Root Directory est correct (`backend` pour le backend)
- Vérifiez que toutes les dépendances sont dans `package.json`

