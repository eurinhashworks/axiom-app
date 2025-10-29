# AXIOM : Suite de Clarté Stratégique IA

## Vue d'ensemble

AXIOM est une application web React conçue pour agir comme un co-pilote stratégique. Elle transforme les "brain dumps" chaotiques et les idées naissantes en analyses structurées, en évaluations objectives et en feuilles de route actionnables, le tout alimenté par l'IA de Google Gemini.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Reference](#api-reference)
- [Développement](#développement)
- [Déploiement](#déploiement)

## Fonctionnalités

### 🧠 Analyse par l'IA

- Soumettez une idée brute (texte ou voix) et recevez un résumé concis
- Questions de clarification pour affiner votre pensée
- Analyse des risques potentiels

### 📊 Évaluation Stratégique

- Évaluation sur 5 critères clés (Urgence, Taille du marché, Avantage concurrentiel, Alignement personnel, Faisabilité technique)
- Scores d'opportunité et de faisabilité
- Justification détaillée de chaque score

### 🗺️ Feuille de Route Interactive

- Génération automatique d'une feuille de route en 5-7 étapes
- Checklist interactive pour suivre la progression
- Focus sur la validation avant la construction

### 📈 Tableau de Bord Visuel

- Gestion de toutes vos idées en un seul endroit
- Visualisation sous forme de cartes
- Tri par score ou date
- Filtrage par titre

### 🎯 Matrice Stratégique

- Vue graphique de type "matrice BCG"
- Positionnement sur l'axe Opportunité vs. Faisabilité
- Aide à la prise de décision rapide

### 🤖 Priorisation par l'IA

- Sélection de plusieurs idées évaluées
- Classement automatique par ordre de priorité
- Justification de type capital-risqueur

### 📤 Exportation

- Export du dossier complet au format Markdown
- Analyse, scores et feuille de route inclus

## Architecture

### Structure du Projet

```
axiom-app/
├── components/           # Composants React
│   ├── auth/            # Authentification
│   ├── dashboard/       # Tableau de bord
│   ├── layout/          # Mise en page
│   ├── session/         # Sessions d'analyse
│   └── ui/              # Composants UI de base
├── contexts/            # Contextes React
├── hooks/               # Hooks personnalisés
├── pages/               # Pages principales
├── services/            # Services API
├── types.ts             # Types TypeScript
└── docs/                # Documentation
```

### Technologies Utilisées

- **Frontend**: React 19, TypeScript, Vite
- **IA**: Google Gemini API
- **Styling**: CSS moderne avec classes utilitaires
- **État**: Context API React
- **Stockage**: LocalStorage

### Flux de Données

1. **Saisie** → L'utilisateur saisit une idée
2. **Analyse** → L'IA analyse et structure l'idée
3. **Évaluation** → L'IA évalue sur 5 critères
4. **Feuille de route** → Génération automatique d'étapes
5. **Visualisation** → Affichage dans le tableau de bord

## Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Clé API Google Gemini

### Installation des dépendances

```bash
npm install
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration de l'API Gemini (OBLIGATOIRE)
GEMINI_API_KEY=your_gemini_api_key_here

# Configuration de l'environnement
NODE_ENV=development
```

### Obtenir une clé API Gemini

1. Allez sur [Google AI Studio](https://aistudio.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Get API key"
4. Copiez la clé et ajoutez-la à votre fichier `.env`

## Utilisation

### Démarrage du serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Workflow principal

1. **Créer une idée** : Cliquez sur "Nouvelle idée" et saisissez un titre
2. **Saisir le brain dump** : Décrivez votre idée en détail
3. **Analyser** : L'IA analyse et structure votre idée
4. **Évaluer** : L'IA évalue votre idée sur 5 critères
5. **Générer la feuille de route** : Créez un plan d'action
6. **Suivre la progression** : Utilisez la checklist interactive

## API Reference

### Services

#### `geminiService.ts`

Service principal pour l'interaction avec l'API Gemini.

**Fonctions principales :**

- `analyzeBrainDump(brainDump: string): Promise<IdeaAnalysis>`
- `evaluateIdea(idea: Idea): Promise<IdeaEvaluation>`
- `generateRoadmap(idea: Idea): Promise<string[]>`
- `prioritizeIdeas(ideas: Idea[]): Promise<string>`

### Types

#### `Idea`

```typescript
interface Idea {
    id: string;
    title: string;
    status: IdeaStatus;
    brainDump: string;
    createdAt: number;
    analysis?: IdeaAnalysis;
    evaluation?: IdeaEvaluation;
    roadmapSteps?: RoadmapStep[];
    opportunityScore?: number;
    feasibilityScore?: number;
}
```

#### `IdeaAnalysis`

```typescript
interface IdeaAnalysis {
    summary: string;
    clarifyingQuestions: string[];
    potentialRisks: string[];
}
```

#### `IdeaEvaluation`

```typescript
interface IdeaEvaluation {
    problemUrgency: number;        // 1-10
    targetMarketSize: number;      // 1-10
    competitiveAdvantage: number;  // 1-10
    personalAlignment: number;     // 1-10
    technicalFeasibility: number;  // 1-10
}
```

## Développement

### Structure des composants

#### Composants principaux

- **`AxiomFlow`** : Composant principal orchestrant le flux
- **`DashboardPage`** : Page du tableau de bord
- **`SessionPage`** : Page de session d'analyse

#### Composants de session

- **`AnalysisView`** : Affichage de l'analyse
- **`EvaluationView`** : Affichage de l'évaluation
- **`RoadmapView`** : Affichage de la feuille de route

### Hooks personnalisés

- **`useIdeas`** : Gestion des idées
- **`useLocalStorage`** : Persistance locale
- **`useLiveSession`** : Session en temps réel

### Contextes

- **`IdeasContext`** : État global des idées
- **`AuthContext`** : Authentification (placeholder)
- **`WorkspaceContext`** : Espaces de travail (placeholder)

## Déploiement

### Build de production

```bash
npm run build
```

### Prévisualisation

```bash
npm run preview
```

### Variables d'environnement de production

Assurez-vous de configurer les variables d'environnement appropriées pour la production.

## Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
