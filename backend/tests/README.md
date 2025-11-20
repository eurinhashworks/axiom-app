# Tests d'Intégration Backend

Ce dossier contient les scripts de test automatisé pour le backend AXIOM.

## 🧪 Scripts Disponibles

### 1. Test Backend Basique (`test-backend.js`)

Teste les routes publiques et la structure de base du backend.

**Usage :**
```bash
cd backend
npm test
# ou directement
node tests/test-backend.js
```

**Tests effectués :**
- ✅ Health check (`/health`)
- ✅ Headers CORS
- ✅ Routes 404
- ✅ Routes authentifiées sans token (401)
- ✅ Routes avec token invalide (401)
- ✅ Validation des requêtes POST

### 2. Test avec Authentification (`test-with-auth.js`)

Teste les routes authentifiées avec un token Firebase réel.

**Prérequis :**
1. Connectez-vous via l'application frontend
2. Ouvrez la console du navigateur (F12)
3. Exécutez :
```javascript
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
console.log('Token:', token);
```
4. Copiez le token

**Usage :**
```bash
cd backend
FIREBASE_TOKEN=votre_token_ici node tests/test-with-auth.js
```

**Tests effectués :**
- ✅ GET `/api/v1/ideas` (liste des idées)
- ✅ POST `/api/v1/ideas` (création d'idée)
- ✅ POST `/api/v1/analysis/analyze` (analyse brain dump)

## 🚀 Démarrage Rapide

### 1. Démarrer le backend

```bash
cd backend
npm run dev
```

### 2. Dans un autre terminal, lancer les tests

```bash
cd backend
npm test
```

### 3. Pour tester avec authentification

```bash
cd backend
# Remplacez YOUR_TOKEN par votre token Firebase
FIREBASE_TOKEN=YOUR_TOKEN node tests/test-with-auth.js
```

## 📋 Checklist de Test

### Tests Basiques (sans authentification)
- [ ] Backend démarre sans erreur
- [ ] `/health` répond correctement
- [ ] Headers CORS présents
- [ ] Routes 404 gérées
- [ ] Routes authentifiées retournent 401 sans token

### Tests avec Authentification
- [ ] GET `/api/v1/ideas` fonctionne
- [ ] POST `/api/v1/ideas` crée une idée
- [ ] POST `/api/v1/analysis/analyze` analyse un brain dump
- [ ] POST `/api/v1/analysis/evaluate` évalue une idée

## 🐛 Dépannage

### Backend non accessible

**Erreur :** `ECONNREFUSED` ou timeout

**Solution :**
1. Vérifiez que le backend est démarré : `npm run dev`
2. Vérifiez le port : `http://localhost:3001`
3. Vérifiez les logs du backend pour des erreurs

### 401 Unauthorized

**Erreur :** Token invalide ou expiré

**Solution :**
1. Récupérez un nouveau token depuis le frontend
2. Vérifiez que le token n'est pas expiré
3. Vérifiez que Firebase Admin est correctement configuré

### 500 Internal Server Error

**Erreur :** Erreur serveur

**Solution :**
1. Regardez les logs du backend
2. Vérifiez que `GEMINI_API_KEY` est configurée dans `.env`
3. Vérifiez que `firebase-service-account.json` est valide

## 🔧 Variables d'Environnement

Les tests utilisent les variables suivantes :

- `BACKEND_URL` : URL du backend (défaut: `http://localhost:3001`)
- `FIREBASE_TOKEN` : Token Firebase pour les tests authentifiés (requis pour `test-with-auth.js`)

## 📝 Exemples de Sortie

### Test Basique Réussi

```
🧪 Tests d'intégration Backend AXIOM

📍 Backend URL: http://localhost:3001

──────────────────────────────────────────────────
✅ Backend accessible

✅ Health Check - Backend accessible
✅ CORS - Headers présents
✅ 404 - Route inexistante
✅ 401 - Route authentifiée sans token
✅ 401 - Route authentifiée avec token invalide
✅ 400 - POST /api/v1/analysis/analyze sans body
✅ Content-Type - Application JSON accepté

──────────────────────────────────────────────────

📊 Résultats: 7 réussis, 0 échoués

🎉 Tous les tests sont passés !
```

## 💡 Prochaines Étapes

Après avoir réussi tous les tests :

1. ✅ Migration du frontend pour utiliser `apiClient`
2. ✅ Tests end-to-end complets
3. ✅ Déploiement sur Vercel
4. ✅ Tests de production

