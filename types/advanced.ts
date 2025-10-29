export interface ScoringResult {
  ideaId: string;
  score: number;
  breakdown: {
    opportunity: number;
    feasibility: number;
    userPreferences: number;
    industryContext: number;
    marketAnalysis: number;
  };
  timestamp: Date;
}

export interface SuccessPrediction {
  ideaId: string;
  probability: number;
  factors: { [key: string]: number };
  timestamp: Date;
}

export interface MarketAnalysis {
  ideaId: string;
  keywords: string[];
  marketSizeEstimate: MarketSizeEstimate;
  marketTrends: MarketTrend[];
  competitors: Competitor[];
  sentimentAnalysis: SentimentAnalysis;
  newsArticles: NewsArticle[];
  timestamp: Date;
}

export interface Competitor {
  name: string;
  url: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export interface MarketSizeEstimate {
  value: number;
  unit: string;
  methodology: string;
}

export interface MarketTrend {
  name: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  mentions: number;
}

export interface NewsArticle {
  title: string;
  url: string;
  summary: string;
  date: Date;
}

export interface CriteriaWeights {
  opportunity: number;
  feasibility: number;
  userPreferences: number;
  industryContext: number;
  marketAnalysis: number;
}

export interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  industryFocus: string[];
  pastIdeaOutcomes: IdeaOutcome[];
  historicalData?: any[];
  industryExpertise?: string[];
  riskTolerance?: string;
  lastUpdated?: any;
}

export interface UserPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  innovationLevel?: 'incremental' | 'disruptive';
  preferredIndustries?: string[];
  opportunityWeights?: {
    marketSize: number;
    problemUrgency: number;
    targetAudience: number;
    competition: number;
    timing: number;
  };
  feasibilityWeights?: {
    technical: number;
    financial: number;
    resources: number;
    timeline: number;
    expertise: number;
  };
  timeHorizon?: 'short' | 'medium' | 'long';
  industryFocus?: string[];
}

export interface IdeaOutcome {
  actualScore: any;
  outcome: string;
  ideaId: string;
  actualOutcome: 'success' | 'failure' | 'neutral';
  reason: string;
  timestamp: Date;
}

export interface ValidationResult {
  isValid: boolean;
  inconsistencies?: Inconsistency[];
}

export interface Inconsistency {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface IndustryContext {
  industry: string;
  keyDrivers: string[];
  regulatoryEnvironment: string;
  technologicalAdvancements: string[];
}

export interface IdeaCluster {
  clusterId: string;
  ideaIds: string[];
  commonThemes: string[];
}

export interface TrainingData {
  features: { [key: string]: number };
  label: number; // 0 for failure, 1 for success
}