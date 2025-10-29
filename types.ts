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