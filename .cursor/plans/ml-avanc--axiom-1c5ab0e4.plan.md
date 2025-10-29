<!-- 1c5ab0e4-0fcf-4da2-940b-32ca8da4cde5 c17190df-98c6-40da-ad5d-0c53633b1c0a -->
# Plan d'Implémentation Expert - AXIOM ML Avancé

## Phase 1 : Infrastructure et Backend (Semaines 1-2)

### 1.1 Configuration Firebase/Supabase

- Créer projet Firebase avec Firestore pour stockage des idées et historique
- Configurer authentification Firebase (Email/Google)
- Créer schéma de base de données :
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Collection `users` : profils utilisateurs
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Collection `ideas` : idées avec métadonnées étendues
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Collection `evaluations` : historique des évaluations
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Collection `feedback` : feedback utilisateur pour ML
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Collection `market_analysis` : résultats de recherche web

### 1.2 Installation des dépendances ML et API

```bash
npm install --save \
  firebase @firebase/firestore \
  mathjs @tensorflow/tfjs @tensorflow/tfjs-node \
  ml-matrix ml-kmeans \
  axios \
  chart.js react-chartjs-2
```

### 1.3 Configuration des variables d'environnement

Ajouter au `.env` :

```
SERPER_API_KEY=your_serper_api_key
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Phase 2 : Services de Base (Semaines 2-3)

### 2.1 Service de recherche web (services/serperService.ts)

```typescript
interface MarketAnalysis {
  competitors: Competitor[];
  marketSize: MarketSizeEstimate;
  trends: MarketTrend[];
  sentiment: SentimentAnalysis;
  newsArticles: NewsArticle[];
}

async function analyzeMarket(idea: Idea): Promise<MarketAnalysis> {
  // Requête Serper API avec mots-clés extraits du brain dump
  // Analyse des résultats : concurrents, taille marché, tendances
  // Calcul du sentiment à partir des articles
}
```

### 2.2 Service Firebase (services/firebaseService.ts)

```typescript
class FirebaseService {
  async saveIdea(idea: Idea): Promise<string>;
  async getIdeas(userId: string): Promise<Idea[]>;
  async saveFeedback(feedback: UserFeedback): Promise<void>;
  async getHistoricalData(filters: HistoryFilters): Promise<Idea[]>;
  async saveMarketAnalysis(analysis: MarketAnalysis): Promise<void>;
}
```

## Phase 3 : Algorithmes de Scoring Avancés (Semaines 3-5)

### 3.1 Service de scoring pondéré adaptatif (services/scoringService.ts)

**Formules mathématiques :**

#### Score d'opportunité pondéré :

```
O = Σ(wi × si × ci) / Σ(wi × ci)

où :
- wi = poids du critère i (configurable)
- si = score du critère i (1-10)
- ci = confiance du critère i (0-1)
```

#### Score de faisabilité avec ajustement contextuel :

```
F = (Σ(wj × sj × cj) / Σ(wj × cj)) × Kcontext

où :
- Kcontext = facteur d'ajustement basé sur profil utilisateur (0.8-1.2)
```

#### Score de confiance global :

```
C = √(Πci) × (1 - σ/10)

où :
- Πci = produit des confiances individuelles
- σ = écart-type des scores normalisés
```

**Implémentation :**

```typescript
class AdaptiveScoringEngine {
  calculateWeightedScore(
    evaluation: IdeaEvaluation,
    weights: CriteriaWeights,
    userProfile: UserProfile,
    industryContext: IndustryContext
  ): ScoringResult {
    // Normalisation des scores (0-1)
    const normalized = this.normalizeScores(evaluation);
    
    // Calcul des poids adaptatifs selon contexte
    const adaptiveWeights = this.adjustWeights(weights, userProfile, industryContext);
    
    // Score pondéré avec confiance
    const opportunityScore = this.weightedAverage(
      [normalized.problemUrgency, normalized.targetMarketSize, normalized.competitiveAdvantage],
      [adaptiveWeights.problemUrgency, adaptiveWeights.targetMarketSize, adaptiveWeights.competitiveAdvantage]
    );
    
    const feasibilityScore = this.weightedAverage(
      [normalized.personalAlignment, normalized.technicalFeasibility],
      [adaptiveWeights.personalAlignment, adaptiveWeights.technicalFeasibility]
    );
    
    return { opportunityScore, feasibilityScore, confidence, breakdown };
  }
}
```

### 3.2 Moteur de validation croisée (services/validationService.ts)

**Détection d'incohérences avec seuils statistiques :**

```
Incohérence si : |zi| > 2 (z-score)

où zi = (xi - μ) / σ
```

**Implémentation :**

```typescript
class ValidationEngine {
  validateConsistency(evaluation: IdeaEvaluation, historicalData: Idea[]): ValidationResult {
    const inconsistencies = [];
    
    // Vérification des corrélations logiques
    if (evaluation.problemUrgency > 8 && evaluation.targetMarketSize < 3) {
      inconsistencies.push({
        type: 'LOGICAL_INCONSISTENCY',
        severity: 'HIGH',
        message: 'Problème urgent mais marché petit - incohérent'
      });
    }
    
    // Détection d'anomalies par z-score
    const zScores = this.calculateZScores(evaluation, historicalData);
    if (Math.abs(zScores.problemUrgency) > 2) {
      inconsistencies.push({
        type: 'STATISTICAL_ANOMALY',
        severity: 'MEDIUM',
        message: 'Score d\'urgence inhabituel'
      });
    }
    
    return { isValid: inconsistencies.length === 0, inconsistencies };
  }
}
```

## Phase 4 : Machine Learning et Prédiction (Semaines 5-8)

### 4.1 Modèle de prédiction de succès (services/mlService.ts)

**Architecture du réseau de neurones :**

```
Input Layer (12 features) → 
Hidden Layer 1 (32 neurons, ReLU) → 
Hidden Layer 2 (16 neurons, ReLU) → 
Output Layer (1 neuron, Sigmoid) → Probabilité de succès
```

**Features utilisées :**

```typescript
const features = [
  evaluation.problemUrgency / 10,
  evaluation.targetMarketSize / 10,
  evaluation.competitiveAdvantage / 10,
  evaluation.personalAlignment / 10,
  evaluation.technicalFeasibility / 10,
  marketAnalysis.competitorCount / 100,
  marketAnalysis.marketGrowthRate,
  marketAnalysis.sentimentScore,
  userProfile.experienceLevel / 5,
  idea.brainDump.length / 1000,
  idea.analysis.clarifyingQuestions.length / 5,
  idea.analysis.potentialRisks.length / 5
];
```

**Implémentation TensorFlow.js :**

```typescript
class MLPredictionEngine {
  private model: tf.LayersModel;
  
  async trainModel(trainingData: TrainingData[]): Promise<void> {
    // Construction du modèle
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [12], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Entraînement
    await this.model.fit(trainX, trainY, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: tf.callbacks.earlyStopping({ patience: 10 })
    });
  }
  
  async predict(idea: Idea): Promise<SuccessPrediction> {
    const features = this.extractFeatures(idea);
    const prediction = this.model.predict(tf.tensor2d([features]));
    const probability = (await prediction.data())[0];
    
    return {
      probability,
      confidence: this.calculateConfidence(features),
      factors: this.explainPrediction(features, probability)
    };
  }
}
```

### 4.2 Système de feedback et apprentissage continu

```typescript
class FeedbackLearningEngine {
  async collectFeedback(ideaId: string, outcome: IdeaOutcome): Promise<void> {
    // Stocker feedback dans Firebase
    // Mettre à jour les poids du modèle
  }
  
  async retrainModel(): Promise<void> {
    // Récupérer nouveaux feedbacks
    // Ré-entraîner le modèle périodiquement
  }
}
```

## Phase 5 : Algorithmes MCDA (Semaines 8-10)

### 5.1 Méthode TOPSIS (services/topsisService.ts)

**Formule TOPSIS :**

```
1. Normalisation : rij = xij / √(Σxij²)
2. Pondération : vij = wi × rij
3. Solution idéale positive : A+ = {max(vij) ∀j}
4. Solution idéale négative : A- = {min(vij) ∀j}
5. Distance à A+ : Di+ = √(Σ(vij - vj+)²)
6. Distance à A- : Di- = √(Σ(vij - vj-)²)
7. Score de proximité : Ci = Di- / (Di+ + Di-)
```

**Implémentation :**

```typescript
class TOPSISPrioritizer {
  calculateRanking(ideas: Idea[], weights: number[]): IdeaRanking[] {
    // Extraction matrice de décision
    const matrix = this.buildDecisionMatrix(ideas);
    
    // Normalisation vectorielle
    const normalized = this.normalizeMatrix(matrix);
    
    // Application des poids
    const weighted = this.applyWeights(normalized, weights);
    
    // Calcul solutions idéales
    const idealPositive = this.calculateIdealPositive(weighted);
    const idealNegative = this.calculateIdealNegative(weighted);
    
    // Calcul distances euclidiennes
    const distances = ideas.map((_, i) => ({
      positive: this.euclideanDistance(weighted[i], idealPositive),
      negative: this.euclideanDistance(weighted[i], idealNegative)
    }));
    
    // Score de proximité
    return ideas.map((idea, i) => ({
      idea,
      score: distances[i].negative / (distances[i].positive + distances[i].negative),
      rank: 0
    })).sort((a, b) => b.score - a.score).map((item, i) => ({ ...item, rank: i + 1 }));
  }
}
```

### 5.2 Méthode AHP (services/ahpService.ts)

**Formule AHP :**

```
1. Matrice comparaisons : aij = importance(i) / importance(j)
2. Vecteur propre : Aw = λmax × w
3. Ratio de cohérence : CR = CI / RI
   où CI = (λmax - n) / (n - 1)
```

**Implémentation :**

```typescript
class AHPPrioritizer {
  calculateWeights(pairwiseComparisons: number[][]): CriterionWeights {
    // Calcul vecteur propre principal (power method)
    const eigenvector = this.powerMethod(pairwiseComparisons);
    
    // Vérification cohérence
    const cr = this.calculateConsistencyRatio(pairwiseComparisons, eigenvector);
    if (cr > 0.1) {
      throw new Error('Matrice incohérente (CR > 0.1)');
    }
    
    return this.normalizeWeights(eigenvector);
  }
}
```

## Phase 6 : Clustering et Segmentation (Semaines 10-12)

### 6.1 K-Means Clustering (services/clusteringService.ts)

**Algorithme K-Means :**

```
1. Initialiser k centroïdes aléatoirement
2. Répéter jusqu'à convergence :
   - Assigner chaque point au centroïde le plus proche
   - Recalculer centroïdes : μk = (1/|Ck|) × Σ(xi ∈ Ck)
3. Métrique : distance euclidienne
```

**Implémentation :**

```typescript
class KMeansClusteringEngine {
  clusterIdeas(ideas: Idea[], k: number = 4): IdeaCluster[] {
    // Extraction features (7 dimensions)
    const features = ideas.map(idea => [
      idea.evaluation?.problemUrgency || 0,
      idea.evaluation?.targetMarketSize || 0,
      idea.evaluation?.competitiveAdvantage || 0,
      idea.evaluation?.personalAlignment || 0,
      idea.evaluation?.technicalFeasibility || 0,
      idea.opportunityScore || 0,
      idea.feasibilityScore || 0
    ]);
    
    // K-means avec ml-kmeans
    const kmeans = new KMeans({ k, maxIterations: 100 });
    const clusters = kmeans.cluster(features);
    
    return this.groupIdeasByClusters(ideas, clusters);
  }
  
  analyzeClusterPatterns(clusters: IdeaCluster[]): ClusterAnalysis {
    return clusters.map(cluster => ({
      id: cluster.id,
      size: cluster.ideas.length,
      centroid: cluster.centroid,
      characteristics: this.identifyCharacteristics(cluster),
      recommendations: this.generateClusterRecommendations(cluster)
    }));
  }
}
```

### 6.2 Système de recommandation basé sur clustering

```typescript
class RecommendationEngine {
  recommendSimilarIdeas(targetIdea: Idea, allIdeas: Idea[]): Idea[] {
    const clusters = this.clusteringEngine.clusterIdeas(allIdeas);
    const targetCluster = this.findCluster(targetIdea, clusters);
    return targetCluster.ideas.filter(i => i.id !== targetIdea.id);
  }
}
```

## Phase 7 : Intégration Frontend (Semaines 12-14)

### 7.1 Nouveaux composants React

**components/advanced/ConfidenceIndicator.tsx**

- Affichage visuel de la confiance (jauge circulaire)
- Explication des facteurs de confiance

**components/advanced/MarketAnalysisView.tsx**

- Affichage analyse de marché Serper
- Graphiques de tendances
- Liste des concurrents

**components/advanced/MLPredictionPanel.tsx**

- Probabilité de succès avec explication
- Facteurs influents (SHAP-like)
- Recommandations personnalisées

**components/advanced/ClusterVisualization.tsx**

- Graphique scatter plot 2D (PCA pour réduction dimensionnalité)
- Points cliquables pour navigation
- Légende des clusters

**components/advanced/MCDARankingView.tsx**

- Tableau comparatif TOPSIS/AHP
- Analyse de sensibilité
- Export des résultats

### 7.2 Modification des vues existantes

**components/session/AnalysisView.tsx**

- Ajouter bouton "Analyser le marché"
- Intégrer MarketAnalysisView
- Afficher ConfidenceIndicator

**components/session/EvaluationView.tsx**

- Remplacer calcul simple par scoring adaptatif
- Afficher breakdown détaillé
- Ajouter MLPredictionPanel
- Afficher alertes de validation

**components/dashboard/DashboardPage.tsx**

- Ajouter onglet "Priorisation MCDA"
- Ajouter vue clustering
- Graphiques de performance ML

## Phase 8 : NLP Avancé avec Gemini (Semaines 14-15)

### 8.1 Extraction d'entités et analyse sémantique

```typescript
async function extractEntities(brainDump: string): Promise<Entities> {
  const prompt = `
Extrayez les entités suivantes du texte :
- Industrie cible
- Problème résolu (mots-clés)
- Public cible (démographie)
- Technologies mentionnées
- Concurrents potentiels

Texte : ${brainDump}

Format JSON.
  `;
  
  return await geminiService.generateStructured(prompt, entitiesSchema);
}
```

### 8.2 Enrichissement de l'analyse avec données web

```typescript
async function enrichAnalysisWithMarketData(
  idea: Idea,
  marketAnalysis: MarketAnalysis
): Promise<EnrichedAnalysis> {
  // Combiner analyse Gemini + données Serper
  // Ajuster scores selon données réelles du marché
  // Générer insights contextuels
}
```

## Phase 9 : Tests et Optimisation (Semaines 15-16)

### 9.1 Tests unitaires et d'intégration

- Tests des algorithmes de scoring
- Tests des modèles ML (précision, rappel, F1-score)
- Tests d'intégration Firebase
- Tests API Serper

### 9.2 Optimisation des performances

- Lazy loading des modèles TensorFlow
- Cache des résultats de recherche web
- Pagination des requêtes Firebase
- Compression des features pour clustering

### 9.3 Documentation technique

- Documentation des formules mathématiques
- Guide d'entraînement du modèle ML
- API reference complète
- Guide de déploiement

## Types TypeScript Étendus

Créer **types/advanced.ts** :

```typescript
export interface ScoringResult {
  opportunityScore: number;
  feasibilityScore: number;
  confidence: number;
  breakdown: ScoreBreakdown;
  recommendations: string[];
}

export interface ScoreBreakdown {
  criteria: {
    name: string;
    score: number;
    weight: number;
    confidence: number;
    contribution: number;
  }[];
}

export interface SuccessPrediction {
  probability: number;
  confidence: number;
  factors: Factor[];
  recommendations: string[];
}

export interface Factor {
  name: string;
  impact: number; // -1 à 1
  importance: number; // 0 à 1
}

export interface MarketAnalysis {
  competitors: Competitor[];
  marketSize: MarketSizeEstimate;
  trends: MarketTrend[];
  sentiment: SentimentAnalysis;
  newsArticles: NewsArticle[];
  lastUpdated: number;
}

export interface IdeaCluster {
  id: string;
  centroid: number[];
  ideas: Idea[];
  characteristics: ClusterCharacteristics;
}

export interface UserProfile {
  experienceLevel: number; // 1-5
  industry: string;
  riskTolerance: number; // 0-1
  preferences: UserPreferences;
  history: IdeaOutcome[];
}
```

## Configuration des Poids par Défaut

Créer **config/defaultWeights.ts** :

```typescript
export const DEFAULT_WEIGHTS = {
  opportunity: {
    problemUrgency: 0.4,
    targetMarketSize: 0.35,
    competitiveAdvantage: 0.25
  },
  feasibility: {
    personalAlignment: 0.5,
    technicalFeasibility: 0.5
  }
};

export const INDUSTRY_ADJUSTMENTS = {
  'tech': { technicalFeasibility: 1.2, competitiveAdvantage: 1.1 },
  'ecommerce': { targetMarketSize: 1.15, problemUrgency: 0.95 },
  'saas': { competitiveAdvantage: 1.2, personalAlignment: 1.1 }
};
```

## Livrables

1. **Services** : 8 nouveaux services (scoring, validation, ML, TOPSIS, AHP, clustering, Serper, Firebase)
2. **Composants** : 5 nouveaux composants avancés + modifications de 3 existants
3. **Modèle ML** : Réseau de neurones entraîné avec dataset initial
4. **Documentation** : Guide complet avec formules mathématiques et exemples
5. **Tests** : Suite de tests couvrant 80%+ du code
6. **Dashboard** : Interface enrichie avec visualisations avancées

## Métriques de Succès

- Précision modèle ML : > 80%
- Cohérence scores : < 5% d'anomalies
- Temps de réponse : < 3s pour analyse complète
- Couverture tests : > 80%
- Satisfaction utilisateur : > 4.5/5

### To-dos

- [ ] Configuration Firebase/Supabase et installation des dépendances ML
- [ ] Créer services Serper API et Firebase avec schémas de données
- [ ] Implémenter algorithmes de scoring adaptatif avec formules mathématiques
- [ ] Développer modèle de prédiction TensorFlow.js et système de feedback
- [ ] Implémenter algorithmes TOPSIS et AHP pour priorisation multi-critères
- [ ] Développer clustering K-Means et système de recommandation
- [ ] Créer composants React avancés et intégrer dans l'UI existante
- [ ] Enrichir analyse NLP avec extraction d'entités et données marché
- [ ] Tests complets, optimisation des performances et documentation