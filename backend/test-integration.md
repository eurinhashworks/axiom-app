# Tests d'Intégration Backend-Frontend

## 🧪 Plan de Test

### 1. Test Backend (Indépendant)

#### Test 1.1 : Démarrage du backend
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

#### Test 1.2 : Health Check
```bash
curl http://localhost:3001/health
```

**Résultat attendu :**
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

### 2. Test Frontend-Backend

#### Test 2.1 : Vérifier que le frontend peut appeler le backend

**Dans le navigateur (console) :**
```javascript
// Test health check
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Résultat attendu :** `{ status: "ok", timestamp: ... }`

#### Test 2.2 : Test avec token Firebase (authentification)

**Prérequis :**
- Utilisateur connecté via Firebase Auth
- Récupérer le token : `const token = await user.getIdToken()`

**Test :**
```javascript
// Depuis le frontend avec utilisateur connecté
const user = auth.currentUser;
const token = await user.getIdToken();

// Test GET /api/v1/ideas
fetch('http://localhost:3001/api/v1/ideas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Résultat attendu :** `{ ideas: [...] }`

### 3. Test Workflow Complet

#### Test 3.1 : Analyse Brain Dump
```javascript
const brainDump = "Je veux créer une app de gestion de tâches pour développeurs";

const analysis = await apiClient.analyzeBrainDump(
  brainDump, 
  undefined, // ideaId optionnel
  token
);

console.log('Analysis:', analysis);
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

#### Test 3.2 : Évaluation d'une idée
```javascript
const idea = {
  title: "App de gestion de tâches",
  analysis: { ... }
};

const evaluation = await apiClient.evaluateIdea(
  idea,
  undefined, // ideaId optionnel
  token
);

console.log('Evaluation:', evaluation);
```

#### Test 3.3 : Créer une idée via API
```javascript
const newIdea = await apiClient.createIdea(
  {
    title: "Test Idea",
    brainDump: "Test brain dump",
    status: "DRAFT"
  },
  token
);

console.log('New Idea:', newIdea);
```

### 4. Vérifications CORS

**Problème potentiel :** CORS bloque les requêtes

**Solution :** Vérifier que `FRONTEND_URL` dans backend correspond à `http://localhost:5173`

```bash
# Dans backend/.env
FRONTEND_URL=http://localhost:5173
```

### 5. Checklist Complète

- [ ] Backend démarre sans erreur
- [ ] `/health` répond correctement
- [ ] Frontend peut appeler `/health` (pas de CORS)
- [ ] Authentification Firebase fonctionne
- [ ] Routes authentifiées fonctionnent (`/api/v1/ideas`)
- [ ] Analyse brain dump fonctionne
- [ ] Évaluation idée fonctionne
- [ ] Création idée via API fonctionne
- [ ] Pas d'erreurs dans la console

