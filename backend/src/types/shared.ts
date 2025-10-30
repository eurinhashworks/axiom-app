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

