# Backend API - AXIOM

Backend Node.js/Express pour l'API AXIOM.

## 🚀 Démarrage Rapide

### 1. Installation

```bash
cd backend
npm install
```

### 2. Configuration

#### Développement local

1. Copier `firebase-service-account.json` à la racine du projet vers `backend/`
2. Créer `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

3. Remplir les variables d'environnement dans `.env`

#### Production (Vercel, Railway, etc.)

Le fichier `firebase-service-account.json` ne doit **PAS** être commité. En production, utilisez des variables d'environnement :

**Option 1 : Variable JSON complète (recommandé)**

Ajoutez la variable d'environnement `FIREBASE_SERVICE_ACCOUNT` avec le contenu JSON complet du service account :

```json
{
  "type": "service_account",
  "project_id": "votre-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

**Option 2 : Variables individuelles**

Ou définissez ces variables séparément :
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY` (avec `\n` pour les retours à la ligne)
- `FIREBASE_CLIENT_EMAIL`

**Sur Vercel :**

1. Allez dans votre projet → Settings → Environment Variables
2. Ajoutez `FIREBASE_SERVICE_ACCOUNT` avec le JSON complet du service account
3. Ajoutez aussi les autres variables nécessaires (`GEMINI_API_KEY`, `FRONTEND_URL`, etc.)

### 3. Démarrage

**Développement :**
```bash
npm run dev
```

**Production :**
```bash
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3001` par défaut.

## 📁 Structure

```
backend/
├── src/
│   ├── routes/          # Routes API
│   │   ├── ideas.routes.ts
│   │   ├── analysis.routes.ts
│   │   └── projects.routes.ts
│   ├── services/        # Services métier
│   │   └── gemini/      # Service Gemini
│   ├── middleware/      # Middleware Express
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── types/           # Types TypeScript
│   └── index.ts         # Point d'entrée
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Ideas

- `GET /api/v1/ideas` - Liste des idées de l'utilisateur
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

Toutes les routes (sauf `/health`) nécessitent un token Firebase.

**Header requis :**
```
Authorization: Bearer <firebase_id_token>
```

Le frontend doit obtenir le token avec :
```typescript
const token = await user.getIdToken();
```

## 📝 Variables d'Environnement

### Développement local

Créer un fichier `.env` dans `backend/` :

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_key_here
```

### Production

Variables requises :

- `FIREBASE_SERVICE_ACCOUNT` - JSON complet du service account Firebase (recommandé)
  **OU** variables individuelles :
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_CLIENT_EMAIL`

- `PORT` - Port du serveur (défaut: 3001)
- `NODE_ENV` - Environnement (production)
- `FRONTEND_URL` - URL du frontend (pour CORS)
- `GEMINI_API_KEY` - Clé API Google Gemini

**Note :** En développement, le fichier `firebase-service-account.json` est utilisé automatiquement. En production, utilisez les variables d'environnement pour des raisons de sécurité.

## 🛠️ Technologies

- Node.js 20+
- Express
- TypeScript
- Firebase Admin SDK
- Google Gemini API

