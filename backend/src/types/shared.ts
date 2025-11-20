// Types partagés entre frontend et backend
// Copier les types essentiels depuis ../types.ts

export type IdeaStatus = 'DRAFT' | 'ANALYZING' | 'ANALYZED' | 'EVALUATED' | 'ROADMAP_GENERATED';

export interface ClarifyingQuestion {
    question: string;
    options: string[];
    explanation?: string;
}

export interface IdeaAnalysis {
    problemUrgency?: any;
    targetAudience?: any;
    competitionLevel?: any;
    summary: string;
    clarifyingQuestions: string[] | ClarifyingQuestion[];
    potentialRisks: string[];
}

export interface TechRecommendation {
    category: string;
    name: string;
    reason: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface IdeaEvaluation {
    technicalComplexity?: any;
    timeToMarket?: any;
    resourceRequirements?: any;
    marketTiming?: any;
    revenuePotential?: any;
    costEfficiency?: any;
    scalability?: any;
    riskLevel?: any;
    innovationLevel?: any;
    problemUrgency: number;
    targetMarketSize: number;
    competitiveAdvantage: number;
    personalAlignment: number;
    technicalFeasibility: number;
    recommendedTechnologies?: TechRecommendation[];
    recommendedDatabases?: TechRecommendation[];
}

export interface Idea {
    id: string;
    title: string;
    status: IdeaStatus;
    brainDump: string;
    createdAt: number;
    updatedAt: number;
    userId: string;
    analysis?: IdeaAnalysis;
    evaluation?: IdeaEvaluation;
    roadmapSteps?: RoadmapStep[];
    opportunityScore?: number;
    feasibilityScore?: number;
    clarifyingAnswers?: ClarifyingQuestionAnswer[];
    isPublic?: boolean;
    authorId?: string;
    authorName?: string;
    authorPhotoURL?: string;
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

