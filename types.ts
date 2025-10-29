// Fix: Create types.ts to define shared data structures.
export type IdeaStatus = 'DRAFT' | 'ANALYZING' | 'ANALYZED' | 'EVALUATED' | 'ROADMAP_GENERATED';

export interface IdeaAnalysis {
    problemUrgency: any;
    targetAudience: any;
    competitionLevel: any;
    summary: string;
    clarifyingQuestions: string[];
    potentialRisks: string[];
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
}

export interface RoadmapStep {
    text: string;
    completed: boolean;
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
}