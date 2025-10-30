# 📊 Refonte Analysis & Evaluation

## Vision : Accompagnateur Intelligent

L'objectif est de transformer l'analyse et l'évaluation en un **vrai guide stratégique** qui aide l'utilisateur à prendre des décisions éclairées et à progresser concrètement.

## 🎯 Structure Proposée

### 1. **ANALYSIS** - Compréhension de l'idée

```typescript
interface IdeaAnalysis {
    // Résumé & Compréhension
.formatted {
    summary: string;                    // Résumé neutre (1-3 phrases)
    keyInsights: Insight[];             // 3-5 insights clés extraits
    problemStatement: ProblemStatement; // Structuration du problème
}

interface Insight {
    type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'unclear';
    text: string;
    importance: 'high' | 'medium' | 'low';
    relatedRisks?: string[];            // IDs de risques liés
}

interface ProblemStatement {
    problem: string;                    // Le problème identifié
    targetAudience: string;             // Qui a ce problème
    currentSolutions?: string[];        // Solutions actuelles (mentionnées)
    painLevel?: 'critical' | 'high' | 'medium' | 'low'; // Niveau de douleur estimé
}

    // Questions de Clarification (améliorées)
    clarifyingQuestions: ClarifyingQuestion[];  // Format actuel OK mais amélioré
    
    // Risques Potentiels (structurés)
    potentialRisks: StructuredRisk[];   // Au lieu de string[]
}

interface StructuredRisk {
    id: string;                         // ID unique pour références
    category: 'market' | 'technical' | 'regulatory' | 'competitive' | 'execution' | 'financial';
    title: string;                      // Titre court du risque
    description: string;                // Description détaillée
    severity: 'critical' | 'high' | 'medium' | 'low';
    mitigation?: string;                // Suggestion de mitigation
    likelihood?: 'certain' | 'likely' | 'possible' | 'unlikely';
}
```

### 2. **EVALUATION** - Scoring & Recommandations Stratégiques

```typescript
interface IdeaEvaluation {
    // Scores Principaux (garder ceux utilisés)
    problemUrgency: number;             // 1-10
    targetMarketSize: number;           // 1-10
    competitiveAdvantage: number;       // 1-10
    personalAlignment: number;          // 1-10
    technicalFeasibility: number;       // 1-10
    
    // Scores Calculés (dérivés)
    opportunityScore: number;           // Calculé (moyenne pondérée)
    feasibilityScore: number;           // Calculé (moyenne pondérée)
    
    // Justifications (NOUVEAU - pour comprendre pourquoi)
    scoreBreakdown: ScoreJustification[];
    
    // Recommandations Technologiques (actuel OK)
    recommendedTechnologies?: TechRecommendation[];
    recommendedDatabases?: TechRecommendation[];
    
    // Recommandations Stratégiques (NOUVEAU)
    strategicRecommendations: StrategicRecommendation[];
    
    // Next Steps Prioritaires (NOUVEAU)
    priorityActions: PriorityAction[];
}

interface ScoreJustification {
    criterion: 'problemUrgency' | 'targetMarketSize' | 'competitiveAdvantage' | 'personalAlignment' | 'technicalFeasibility';
    score: number;
    reasoning: string;                  // Pourquoi ce score
    strengths: string[];                // Points forts identifiés
    weaknesses: string[];               // Points faibles identifiés
    improvementSuggestions?: string[];  // Comment améliorer
}

interface StrategicRecommendation {
    type: 'validation' | 'pivot' | 'partnership' | 'focus' | 'research' | 'build';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    timeframe?: 'immediate' | 'short-term' | 'medium-term';
    relatedCriteria: string[];          // Critères qui justifient cette recommandation
}

interface PriorityAction {
    action: string;                     // Action concrète
    why: string;                        // Pourquoi cette action est prioritaire
    estimatedEffort: 'low' | 'medium' | 'high';
    dependencies?: string[];            // Autres actions nécessaires avant
    expectedOutcome: string;            // Résultat attendu
}
```

## 🔄 Workflow Amélioré

### Étape 1 : Brain Dump → Analysis
- Génère `IdeaAnalysis` avec la nouvelle structure
- Identifie automatiquement les insights (forces/faiblesses)
- Structure le problème de manière claire
- Catégorise et priorise les risques

### Étape 2 : Quiz de Clarification
- L'utilisateur répond aux questions
- Les réponses influencent l'évaluation suivante

### Étape 3 : Evaluation
- Score sur 5 critères avec justifications détaillées
- Génère des recommandations stratégiques basées sur les scores faibles
- Identifie les 3-5 actions prioritaires immédiates
- Met en avant ce qui doit être validé AVANT de construire

### Étape 4 : Dashboard Enrichi
- Affichage des insights clés
- Visualisation des risques par catégorie
- Roadmap de validation basée sur les recommandations
- Suggestions contextuelles dans le dashboard

## 📈 Améliorations UX

1. **Visualisation des Insights** : Carte colorée (vert/orange/rouge) selon le type
2. **Risques Interactifs** : Expandable cards avec mitigation suggérée
3. **Scores avec Explications** : Hover ou clic pour voir la justification complète
4. **Actions Prioritaires** : Checklist claire des prochaines étapes
5. **Progression** : Indicateur de progression "Analyse → Evaluation → Validation → Build"

## 🎨 Composants à Créer/Refactorer

1. `AnalysisView` → `AnalysisViewEnhanced` avec insights et risques structurés
2. `EvaluationView` → `EvaluationViewEnhanced` avec justifications et recommandations
3. `StrategicRecommendations` → Nouveau composant pour les recommandations
4. `PriorityActions` → Checklist des actions prioritaires
5. `RiskMatrix` → Visualisation des risques par catégorie/gravité

## 🚀 Migration

- Compatibilité ascendante : détecter l'ancien format et le convertir
- Nettoyage progressif : supprimer les champs `any` non utilisés
- Tests : Valider que tous les composants fonctionnent avec la nouvelle structure

