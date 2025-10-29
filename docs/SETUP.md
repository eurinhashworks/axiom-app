# Guide d'Installation et de Configuration - AXIOM

## Prérequis

### Logiciels requis

- **Node.js** : Version 18 ou supérieure
- **npm** : Version 8 ou supérieure (inclus avec Node.js)
- **Git** : Pour cloner le repository

### Comptes requis

- **Compte Google** : Pour accéder à l'API Gemini
- **GitHub** (optionnel) : Pour contribuer au projet

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/axiom-app.git
cd axiom-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

#### Créer le fichier .env

Créez un fichier `.env` à la racine du projet :

```bash
touch .env
```

#### Configurer les variables d'environnement

Ouvrez le fichier `.env` et ajoutez :

```env
# Configuration de l'API Gemini (OBLIGATOIRE)
GEMINI_API_KEY=your_gemini_api_key_here

# Configuration de l'environnement
NODE_ENV=development
```

### 4. Obtenir une clé API Gemini

#### Étape 1 : Accéder à Google AI Studio

1. Allez sur [Google AI Studio](https://aistudio.google.com/)
2. Connectez-vous avec votre compte Google

#### Étape 2 : Créer une clé API

1. Cliquez sur "Get API key" dans le menu
2. Cliquez sur "Create API key"
3. Sélectionnez un projet Google Cloud ou créez-en un nouveau
4. Copiez la clé générée

#### Étape 3 : Ajouter la clé au fichier .env

Remplacez `your_gemini_api_key_here` par votre clé API :

```env
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Configuration avancée

### Variables d'environnement supplémentaires

#### Configuration Firebase (optionnel)

Si vous souhaitez ajouter l'authentification Firebase :

```env
# Configuration Firebase (optionnel)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

#### Configuration de production

Pour la production, ajoutez :

```env
NODE_ENV=production
VITE_API_URL=https://your-api-domain.com
```

### Configuration Vite

Le fichier `vite.config.ts` peut être modifié pour :

#### Changer le port

```typescript
export default defineConfig({
    server: {
        port: 3000, // Changer le port
        host: 'localhost',
    },
    // ...
});
```

#### Ajouter des alias de chemins

```typescript
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('.', import.meta.url)),
            '@components': fileURLToPath(new URL('./components', import.meta.url)),
            '@services': fileURLToPath(new URL('./services', import.meta.url)),
        }
    },
    // ...
});
```

## Dépannage

### Problèmes courants

#### 1. Erreur "Permission denied" sur le port

**Symptôme :**
```
Error: listen EACCES: permission denied 0.0.0.0:3000
```

**Solution :**
- Changez le port dans `vite.config.ts`
- Ou utilisez `sudo` (non recommandé)

#### 2. Erreur "API key not found"

**Symptôme :**
```
Error: API key not found
```

**Solution :**
- Vérifiez que le fichier `.env` existe
- Vérifiez que la variable `GEMINI_API_KEY` est définie
- Redémarrez le serveur de développement

#### 3. Erreur de CORS

**Symptôme :**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution :**
- Vérifiez que votre clé API Gemini est valide
- Vérifiez les quotas de l'API

#### 4. Erreur de build

**Symptôme :**
```
Build failed with errors
```

**Solution :**
```bash
# Nettoyer le cache
npm run clean

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Relancer le build
npm run build
```

### Vérification de l'installation

#### Test de l'API Gemini

Créez un fichier de test `test-api.js` :

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testAPI() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: 'Test de connexion',
        });
        console.log('✅ API Gemini fonctionne');
        console.log(response.text);
    } catch (error) {
        console.error('❌ Erreur API Gemini:', error.message);
    }
}

testAPI();
```

Lancez le test :

```bash
node test-api.js
```

#### Test de l'application

1. Ouvrez `http://localhost:5173`
2. Créez une nouvelle idée
3. Saisissez un brain dump
4. Vérifiez que l'analyse se génère correctement

## Déploiement

### Build de production

```bash
npm run build
```

### Prévisualisation du build

```bash
npm run preview
```

### Déploiement sur Vercel

1. Installez Vercel CLI :
```bash
npm i -g vercel
```

2. Déployez :
```bash
vercel
```

3. Configurez les variables d'environnement dans le dashboard Vercel

### Déploiement sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement
3. Déployez automatiquement

## Scripts disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Build
npm run build        # Build de production
npm run preview      # Prévisualise le build

# Linting
npm run lint         # Vérifie le code avec ESLint
npm run lint:fix     # Corrige automatiquement les erreurs

# Tests
npm run test         # Lance les tests
npm run test:watch   # Lance les tests en mode watch
```

## Structure des fichiers

```
axiom-app/
├── .env                 # Variables d'environnement
├── .env.example         # Exemple de configuration
├── .gitignore           # Fichiers ignorés par Git
├── package.json         # Dépendances et scripts
├── vite.config.ts       # Configuration Vite
├── tsconfig.json        # Configuration TypeScript
├── components/          # Composants React
├── contexts/            # Contextes React
├── hooks/               # Hooks personnalisés
├── pages/               # Pages de l'application
├── services/            # Services API
├── types.ts             # Types TypeScript
└── docs/                # Documentation
```

## Support

### Ressources utiles

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Google Gemini](https://ai.google.dev/)
- [Documentation TypeScript](https://www.typescriptlang.org/)

### Obtenir de l'aide

1. Vérifiez la section [Dépannage](#dépannage)
2. Consultez les [Issues GitHub](https://github.com/votre-username/axiom-app/issues)
3. Créez une nouvelle issue si le problème persiste

### Contribution

1. Fork le repository
2. Créez une branche feature
3. Committez vos changements
4. Ouvrez une Pull Request

## Changelog

### Version 1.0.0
- Version initiale
- Analyse d'idées par IA
- Évaluation stratégique
- Feuille de route interactive
- Tableau de bord visuel
