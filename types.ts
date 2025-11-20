// Fix: Create types.ts to define shared data structures.
export type IdeaStatus = 'DRAFT' | 'ANALYZING' | 'ANALYZED' | 'EVALUATED' | 'ROADMAP_GENERATED';

export interface ClarifyingQuestion {
    question: string;
    options: string[];
    explanation?: string; // Explique pourquoi cette question est importante
}

export interface IdeaAnalysis {
    problemUrgency: any;
    targetAudience: any;
    competitionLevel: any;
    summary: string;
    clarifyingQuestions: string[] | ClarifyingQuestion[]; // Support ancien et nouveau format
    potentialRisks: string[];
}

export interface TechRecommendation {
    category: string; // 'Frontend', 'Backend', 'Database', 'Infrastructure', 'Tooling'
    name: string;
    reason: string; // Pourquoi cette technologie est recommandée
    difficulty: 'easy' | 'medium' | 'hard'; // Complexité d'apprentissage
}

export interface IdeaEvaluation {
    technicalComplexity: any;
    timeToMarket: any;
    resourceRequirements: any;
    marketTiming: any;
    revenuePotential: any;
    costEfficiency: any;
    scalability: any;
    riskLevel: any;
    innovationLevel: any;
    problemUrgency: number;
    targetMarketSize: number;
    competitiveAdvantage: number;
    personalAlignment: number;
    technicalFeasibility: number;
    recommendedTechnologies?: TechRecommendation[];
    recommendedDatabases?: TechRecommendation[];
}

export interface RoadmapStep {
    text: string;
    completed: boolean;
}

export interface ClarifyingQuestionAnswer {
    questionIndex: number;
    question: string;
    selectedOption: string;
    timestamp: number;
}

// ============================================================================
// Sprint 1: Recherche Web + SWOT + Go/No-Go
// ============================================================================

export interface Strength {
    description: string;
    impact: 'high' | 'medium' | 'low';
    evidence?: string;
}

export interface Weakness {
    description: string;
    severity: 'high' | 'medium' | 'low';
    mitigation?: string;
}

export interface Opportunity {
    description: string;
    potential: 'high' | 'medium' | 'low';
    timeframe?: string;
}

export interface Threat {
    description: string;
    likelihood: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    mitigation?: string;
}

export interface SWOTAnalysis {
    strengths: Strength[];
    weaknesses: Weakness[];
    opportunities: Opportunity[];
    threats: Threat[];
    strategicImplications: string[];
}

export interface Competitor {
    name: string;
    url?: string;
    type: 'direct' | 'indirect';
    description?: string;
    strengths?: string[];
    weaknesses?: string[];
    marketShare?: string;
}

export interface MarketTrend {
    trend: string;
    description: string;
    relevance: 'high' | 'medium' | 'low';
    source?: string;
    date?: string;
}

export interface NewsArticle {
    title: string;
    url: string;
    snippet: string;
    date?: string;
    source?: string;
}

export interface WebResearchResults {
    competitors: Competitor[];
    marketTrends: MarketTrend[];
    newsArticles: NewsArticle[];
    searchQueries: string[];
}

export interface CompetitiveAnalysis {
    directCompetitors: Competitor[];
    indirectCompetitors: Competitor[];
    competitiveAdvantages: string[];
    competitiveGaps: string[];
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
}

export interface GoNoGoRecommendation {
    decision: 'go' | 'no-go' | 'pivot' | 'wait';
    confidence: number; // 0-100
    rationale: string;
    keyFactors: {
        positive: string[];
        negative: string[];
    };
    conditions: string[];
}

export interface Idea {
    marketSize: number;
    problemUrgency: number;
    targetAudience: number;
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
    isPublic?: boolean;
    authorId?: string;
    authorName?: string;
    authorPhotoURL?: string;
    clarifyingAnswers?: ClarifyingQuestionAnswer[]; // Réponses aux questions du quiz
    isFavorite?: boolean;
    isArchived?: boolean;
    tags?: string[];
    userId: string;
    updatedAt: number;
    likeCount?: number; // Nombre total de likes (pour éviter de charger tous les likes)
    // Sprint 1: Nouveaux champs
    swotAnalysis?: SWOTAnalysis;
    webResearch?: WebResearchResults;
    competitiveAnalysis?: CompetitiveAnalysis;
    goNoGo?: GoNoGoRecommendation;
}

export interface Comment {
    id: string;
    ideaId: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    content: string;
    createdAt: number;
}

export interface Like {
    id: string;
    ideaId: string;
    userId: string;
    createdAt: number;
}

// Sprint 1: Roadmaps / Steps / Progress
export interface Roadmap {
    id: string;
    ownerId: string; // utilisateur propriétaire
    title: string;
    description?: string;
    goals?: string[];
    createdAt: number;
    updatedAt?: number;
}

export interface Step {
    id: string;
    roadmapId: string;
    title: string;
    description?: string;
    prerequisites?: string[]; // ids de steps
    estimateMinutes?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    tips?: string[];
    proofOfProgress?: {
        type: 'link' | 'file' | 'text';
        instructions?: string;
    };
    order?: number; // pour tri simple
    createdAt: number;
}

export interface UserProgress {
    id: string; // `${userId}_${roadmapId}` ou doc auto + champs clés
    userId: string;
    roadmapId: string;
    completedStepIds: string[];
    currentStepId?: string;
    lastActivityAt: number;
}