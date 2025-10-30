# 🚀 Guide de Migration vers Backend

## ✅ Ce qui a été créé

### Backend Structure
```
backend/
├── src/
│   ├── index.ts                    # Serveur Express principal
│   ├── routes/
│   │   ├── ideas.routes.ts         # CRUD idées
│   │   ├── analysis.routes.ts      # Analyse & évaluation
│   │   └── projects.routes.ts      # Projets (placeholder)
│   ├── services/
│   │   └── gemini/
│   │       └── gemini.service.ts   # Service Gemini (déplacé du frontend)
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Authentification Firebase
│   │   └── error.middleware.ts     # Gestion erreurs
│   └── types/
│       └── shared.ts               # Types partagés
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Frontend API Client
```
services/
└── apiClient.ts                    # Client pour appeler le backend
```

## 📋 Prochaines Étapes

### 1. Installation Backend

```bash
cd backend
npm install
```

### 2. Configuration

1. **Copier `firebase-service-account.json`** :
   ```bash
   cp ../firebase-service-account.json backend/
   ```

2. **Créer `.env`** :
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Remplir `.env`** :
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   GEMINI_API_KEY=your_key_here
   ```

### 3. Démarrer le Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### 4. Mettre à jour le Frontend

**Option A : Utiliser le nouveau client API (recommandé)**

Modifier les services frontend pour utiliser `apiClient` au lieu d'appeler Gemini directement :

```typescript
// Avant (dans geminiService.ts)
import { analyzeBrainDump } from '../services/geminiService';

// Après (dans les composants)
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();
const token = await user?.getIdToken();

const { analysis } = await apiClient.analyzeBrainDump(
  brainDump,
  ideaId,
  token
);
```

**Option B : Migration progressive**

- Garder `geminiService.ts` pour l'instant
- Migrer progressivement vers `apiClient`
- Une fois tout migré, supprimer `geminiService.ts` du frontend

### 5. Variables d'Environnement Frontend

Ajouter dans `.env` (racine du projet) :

```env
VITE_API_URL=http://localhost:3001
```

## 🔄 Endpoints Disponibles

### Ideas
- `GET /api/v1/ideas` - Liste des idées
- `GET /api/v1/ideas/:id` - Détails d'une idée
- `POST /api/v1/ideas` - Créer une idée
- `PUT /api/v1/ideas/:id` - Modifier une idée
- `DELETE /api/v1/ideas/:id` - Supprimer une idée

### Analysis
- `POST /api/v1/analysis/analyze` - Analyser un brain dump
- `POST /api/v1/analysis/evaluate` - Évaluer une idée

### Health
- `GET /health` - Status du serveur

## 🔐 Authentification

Toutes les routes nécessitent un token Firebase :

```typescript
const token = await user.getIdToken();
```

Le token est envoyé dans le header :
```
Authorization: Bearer <token>
```

## ⚠️ Notes Importantes

1. **Gemini Service** : Maintenant côté backend uniquement (API keys sécurisées)
2. **Firebase Firestore** : Toujours accessible depuis le frontend pour les données utilisateur
3. **Migration Progressive** : Pas besoin de tout migrer d'un coup
4. **CORS** : Configuré pour accepter `http://localhost:5173` (modifier si nécessaire)

## 🐛 Troubleshooting

### Backend ne démarre pas
- Vérifier que `firebase-service-account.json` existe dans `backend/`
- Vérifier que `.env` est bien configuré
- Vérifier que le port 3001 est disponible

### Erreur CORS
- Vérifier `FRONTEND_URL` dans `.env` du backend
- Vérifier que le frontend utilise la bonne URL dans `VITE_API_URL`

### Erreur d'authentification
- Vérifier que le token Firebase est bien envoyé
- Vérifier que Firebase Admin SDK est correctement initialisé

## 📚 Documentation

- Backend README : `backend/README.md`
- Architecture : `ARCHITECTURE_RECOMMANDATIONS.md`

