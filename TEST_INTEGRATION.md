# 🧪 Guide de Test d'Intégration Backend-Frontend

## 📋 Prérequis

Avant de commencer les tests, assurez-vous d'avoir :

1. ✅ Le fichier `backend/firebase-service-account.json` présent
2. ✅ Un fichier `.env` dans `backend/` avec les variables nécessaires
3. ✅ Node.js installé et fonctionnel
4. ✅ Les dépendances installées (`npm install` dans `backend/` et à la racine)

## 🔧 Configuration Initiale

### 1. Créer le fichier `.env` du backend

Créez `backend/.env` avec le contenu suivant :

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=votre_clé_gemini_ici
```

**Important :** Remplacez `votre_clé_gemini_ici` par votre vraie clé API Gemini.

### 2. Vérifier Firebase Service Account

Le fichier `backend/firebase-service-account.json` doit exister (copié depuis la racine du projet).

## 🚀 Tests Séquentiels

### Test 1 : Démarrage du Backend

**Dans un terminal :**

```bash
cd backend
npm run dev
```

**Résultat attendu :**
```
✅ Firebase Admin initialisé avec fichier local firebase-service-account.json
🚀 Backend API server running on port 3001
📝 Environment: development
```

**Si erreur :**
- Vérifiez que `firebase-service-account.json` existe dans `backend/`
- Vérifiez que le fichier `.env` existe avec `GEMINI_API_KEY`
- Vérifiez les logs d'erreur

### Test 2 : Health Check (Backend seul)

**Dans un nouveau terminal (ou curl/Postman) :**

```bash
curl http://localhost:3001/health
```

**Résultat attendu :**
```json
{"status":"ok","timestamp":1234567890}
```

**Si erreur :**
- Vérifiez que le backend tourne sur le port 3001
- Vérifiez les logs du backend pour des erreurs

### Test 3 : Health Check depuis le Frontend

**Démarrer le frontend :**

```bash
# Dans un nouveau terminal à la racine
npm run dev:frontend
```

**Dans la console du navigateur (F12) :**

```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Résultat attendu :** `{ status: "ok", timestamp: ... }`

**Si erreur CORS :**
- Vérifiez que `FRONTEND_URL=http://localhost:5173` dans `backend/.env`
- Redémarrez le backend après modification

### Test 4 : Test avec Authentification

**Prérequis :** Connectez-vous via Firebase Auth dans l'application frontend.

**Dans la console du navigateur :**

```javascript
// Récupérer le token Firebase
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Tester GET /api/v1/ideas
fetch('http://localhost:3001/api/v1/ideas', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Résultat attendu :** `{ ideas: [...] }`

**Si erreur 401 :**
- Vérifiez que le token Firebase est valide
- Vérifiez que Firebase Admin est bien initialisé côté backend

**Si erreur 500 :**
- Vérifiez les logs du backend
- Vérifiez que `firebase-service-account.json` est valide

### Test 5 : Test Workflow Complet (Analyse)

**Dans la console du navigateur (avec token) :**

```javascript
const brainDump = "Je veux créer une app de gestion de tâches pour développeurs";

const response = await fetch('http://localhost:3001/api/v1/analysis/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    brainDump: brainDump
  })
});

const result = await response.json();
console.log('Analysis:', result);
```

**Résultat attendu :**
```json
{
  "analysis": {
    "summary": "...",
    "clarifyingQuestions": [...],
    "potentialRisks": [...]
  }
}
```

**Si erreur :**
- Vérifiez que `GEMINI_API_KEY` est correct dans `backend/.env`
- Vérifiez les logs du backend pour des erreurs Gemini API
- Vérifiez que la clé Gemini a les quotas nécessaires

### Test 6 : Utiliser apiClient (Frontend)

**Test de migration :** Utiliser `apiClient` au lieu de `geminiService` directement.

**Dans un composant React (ex: test temporaire) :**

```typescript
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

// Dans un composant
const { user } = useAuth();

const testApiClient = async () => {
  if (!user) {
    console.error('User not logged in');
    return;
  }
  
  try {
    const token = await user.getIdToken();
    
    // Test health check
    const health = await apiClient.healthCheck();
    console.log('Health:', health);
    
    // Test analyse
    const analysis = await apiClient.analyzeBrainDump(
      "Test brain dump",
      undefined,
      token
    );
    console.log('Analysis:', analysis);
    
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## ✅ Checklist Complète

- [ ] Backend démarre sans erreur (`npm run dev` dans `backend/`)
- [ ] `/health` répond correctement (curl ou navigateur)
- [ ] Pas d'erreur CORS entre frontend et backend
- [ ] Authentification Firebase fonctionne
- [ ] `GET /api/v1/ideas` fonctionne avec token
- [ ] `POST /api/v1/analysis/analyze` fonctionne
- [ ] `POST /api/v1/analysis/evaluate` fonctionne
- [ ] `apiClient` peut communiquer avec le backend

## 🐛 Problèmes Courants

### Backend ne démarre pas

**Erreur :** `Firebase Admin non initialisé`

**Solution :**
1. Vérifiez que `firebase-service-account.json` existe dans `backend/`
2. Vérifiez que le fichier JSON est valide

**Erreur :** `Clé API Gemini manquante`

**Solution :**
1. Vérifiez que `.env` existe dans `backend/`
2. Vérifiez que `GEMINI_API_KEY=...` est présent

### CORS Error

**Erreur :** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution :**
1. Vérifiez `FRONTEND_URL=http://localhost:5173` dans `backend/.env`
2. Redémarrez le backend
3. Vérifiez que le port du frontend est bien 5173

### 401 Unauthorized

**Erreur :** `Token d'authentification manquant`

**Solution :**
1. Vérifiez que l'utilisateur est connecté via Firebase Auth
2. Vérifiez que le token est bien passé dans le header `Authorization: Bearer <token>`
3. Vérifiez que le token n'est pas expiré

### 500 Internal Server Error

**Erreur :** Erreur serveur lors de l'appel API

**Solution :**
1. Regardez les logs du backend pour l'erreur exacte
2. Vérifiez que `firebase-service-account.json` est valide
3. Vérifiez que `GEMINI_API_KEY` est valide et a des quotas

## 📝 Prochaines Étapes

Une fois tous les tests passés :

1. ✅ Migration complète du frontend pour utiliser `apiClient` au lieu de `geminiService`
2. ✅ Suppression de `geminiService.ts` du frontend (optionnel)
3. ✅ Tests end-to-end complets
4. ✅ Déploiement sur Vercel

