# API Reference - AXIOM

## Vue d'ensemble

Cette documentation décrit l'API interne d'AXIOM, principalement le service Gemini et les interfaces de données.

## Service Gemini (`services/geminiService.ts`)

### Configuration

Le service utilise l'API Google Gemini pour toutes les opérations d'IA.

```typescript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
```

### Fonctions principales

#### `analyzeBrainDump(brainDump: string): Promise<IdeaAnalysis>`

Analyse un brain dump d'idée d'entreprise et retourne une analyse structurée.

**Paramètres :**
- `brainDump` (string) : Le texte brut de l'idée à analyser

**Retour :**
```typescript
interface IdeaAnalysis {
    summary: string;                    // Résumé concis (1-3 phrases)
    clarifyingQuestions: string[];      // 3-5 questions critiques
    potentialRisks: string[];          // 3-5 risques potentiels
}
```

**Exemple d'utilisation :**
```typescript
const analysis = await analyzeBrainDump("Je veux créer une app de livraison...");
console.log(analysis.summary);
```

#### `evaluateIdea(idea: Idea): Promise<IdeaEvaluation>`

Évalue une idée d'entreprise sur 5 critères clés.

**Paramètres :**
- `idea` (Idea) : L'objet idée avec son analyse

**Retour :**
```typescript
interface IdeaEvaluation {
    problemUrgency: number;        // 1-10 : Urgence du problème
    targetMarketSize: number;      // 1-10 : Taille du marché cible
    competitiveAdvantage: number;  // 1-10 : Avantage concurrentiel
    personalAlignment: number;     // 1-10 : Alignement personnel
    technicalFeasibility: number;  // 1-10 : Faisabilité technique
}
```

**Exemple d'utilisation :**
```typescript
const evaluation = await evaluateIdea(idea);
const opportunityScore = (evaluation.problemUrgency + 
                         evaluation.targetMarketSize + 
                         evaluation.competitiveAdvantage) / 3;
```

#### `generateRoadmap(idea: Idea): Promise<string[]>`

Génère une feuille de route actionnable pour une idée évaluée.

**Paramètres :**
- `idea` (Idea) : L'objet idée avec son analyse et évaluation

**Retour :**
```typescript
string[] // Array de 5-7 étapes actionnables
```

**Exemple d'utilisation :**
```typescript
const roadmapSteps = await generateRoadmap(idea);
roadmapSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
});
```

#### `prioritizeIdeas(ideas: Idea[]): Promise<string>`

Priorise une liste d'idées évaluées et retourne une analyse de priorisation.

**Paramètres :**
- `ideas` (Idea[]) : Array d'idées évaluées

**Retour :**
```typescript
string // Analyse de priorisation en Markdown
```

**Exemple d'utilisation :**
```typescript
const prioritization = await prioritizeIdeas([idea1, idea2, idea3]);
console.log(prioritization); // Markdown formaté
```

## Schémas de validation

### `analysisSchema`

Schéma JSON pour la validation des analyses d'idées.

```typescript
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Un résumé concis de l'idée principale..."
        },
        clarifyingQuestions: {
            type: Type.ARRAY,
            description: "Une liste de 3-5 questions critiques...",
            items: { type: Type.STRING }
        },
        potentialRisks: {
            type: Type.ARRAY,
            description: "Une liste de 3-5 risques potentiels...",
            items: { type: Type.STRING }
        }
    },
    required: ["summary", "clarifyingQuestions", "potentialRisks"]
};
```

### `evaluationSchema`

Schéma JSON pour la validation des évaluations d'idées.

```typescript
const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        problemUrgency: {
            type: Type.NUMBER,
            description: "Score (1-10) pour l'urgence du problème..."
        },
        targetMarketSize: {
            type: Type.NUMBER,
            description: "Score (1-10) pour la taille du marché..."
        },
        competitiveAdvantage: {
            type: Type.NUMBER,
            description: "Score (1-10) pour l'avantage concurrentiel..."
        },
        personalAlignment: {
            type: Type.NUMBER,
            description: "Score (1-10) pour l'alignement personnel..."
        },
        technicalFeasibility: {
            type: Type.NUMBER,
            description: "Score (1-10) pour la faisabilité technique..."
        }
    },
    required: ["problemUrgency", "targetMarketSize", "competitiveAdvantage", 
              "personalAlignment", "technicalFeasibility"]
};
```

### `roadmapSchema`

Schéma JSON pour la validation des feuilles de route.

```typescript
const roadmapSchema = {
    type: Type.OBJECT,
    properties: {
        roadmapSteps: {
            type: Type.ARRAY,
            description: "Une liste de 5-7 étapes actionnables...",
            items: { type: Type.STRING }
        }
    },
    required: ["roadmapSteps"]
};
```

## Gestion des erreurs

### Erreurs de parsing JSON

```typescript
try {
    const parsed = JSON.parse(jsonText);
    return parsed as IdeaAnalysis;
} catch (e) {
    console.error("Failed to parse analysis JSON:", jsonText);
    throw new Error("The model returned an invalid analysis format.");
}
```

### Erreurs d'API

Le service gère automatiquement les erreurs de l'API Gemini et les convertit en erreurs applicatives.

## Configuration

### Variables d'environnement requises

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Configuration Vite

```typescript
// vite.config.ts
define: {
    'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

## Exemples d'utilisation complets

### Workflow complet d'analyse

```typescript
import { analyzeBrainDump, evaluateIdea, generateRoadmap } from './services/geminiService';

async function analyzeIdea(brainDump: string) {
    try {
        // 1. Analyser le brain dump
        const analysis = await analyzeBrainDump(brainDump);
        
        // 2. Créer l'objet idée
        const idea = {
            id: 'idea-123',
            title: 'Mon idée',
            brainDump,
            analysis,
            // ... autres propriétés
        };
        
        // 3. Évaluer l'idée
        const evaluation = await evaluateIdea(idea);
        
        // 4. Calculer les scores
        const opportunityScore = (
            evaluation.problemUrgency + 
            evaluation.targetMarketSize + 
            evaluation.competitiveAdvantage
        ) / 3;
        
        const feasibilityScore = (
            evaluation.personalAlignment + 
            evaluation.technicalFeasibility
        ) / 2;
        
        // 5. Générer la feuille de route
        const roadmapSteps = await generateRoadmap({
            ...idea,
            evaluation,
            opportunityScore,
            feasibilityScore
        });
        
        return {
            ...idea,
            evaluation,
            opportunityScore,
            feasibilityScore,
            roadmapSteps
        };
        
    } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
        throw error;
    }
}
```

### Priorisation de plusieurs idées

```typescript
import { prioritizeIdeas } from './services/geminiService';

async function prioritizeIdeasList(ideas: Idea[]) {
    try {
        const prioritization = await prioritizeIdeas(ideas);
        console.log('Analyse de priorisation:', prioritization);
        return prioritization;
    } catch (error) {
        console.error('Erreur lors de la priorisation:', error);
        throw error;
    }
}
```

## Notes de performance

- Les appels API sont asynchrones et peuvent prendre 2-5 secondes
- Le cache local est utilisé pour éviter les appels redondants
- Les erreurs de réseau sont gérées avec des retry automatiques
- Les réponses sont validées avant d'être retournées
