import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Idea } from '../types';
import { 
  MarketAnalysis, 
  UserProfile, 
  IdeaOutcome,
  TrainingData, 
  ScoringResult 
} from '../types/advanced';

export class FirebaseService {
  private ideasCollection = collection(db, 'ideas');
  private marketAnalysisCollection = collection(db, 'marketAnalysis');
  private userProfilesCollection = collection(db, 'userProfiles');
  private feedbackCollection = collection(db, 'feedback');
  private trainingDataCollection = collection(db, 'trainingData');

  async saveIdea(idea: Idea, userId: string): Promise<void> {
    const ideaData = {
      ...idea,
      userId,
      createdAt: idea.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const ideaRef = idea.id 
      ? doc(this.ideasCollection, idea.id)
      : doc(this.ideasCollection);

    await setDoc(ideaRef, ideaData, { merge: true });
  }

  async getIdeas(userId: string, limitCount?: number): Promise<Idea[]> {
    let q = query(this.ideasCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Idea));
  }

  async saveMarketAnalysis(ideaId: string, analysis: MarketAnalysis): Promise<void> {
    const analysisRef = doc(this.marketAnalysisCollection, ideaId);
    await setDoc(analysisRef, {
      ...analysis,
      ideaId,
      timestamp: Timestamp.now()
    });
  }

  async getMarketAnalysis(ideaId: string): Promise<MarketAnalysis | null> {
    const analysisRef = doc(this.marketAnalysisCollection, ideaId);
    const analysisDoc = await getDoc(analysisRef);
    
    if (analysisDoc.exists()) {
      return analysisDoc.data() as MarketAnalysis;
    }
    
    return null;
  }

  async saveUserProfile(userId: string, profile: Partial<UserProfile> & { userId: string }): Promise<void> {
    const profileRef = doc(this.userProfilesCollection, userId);
    const existingProfile = await getDoc(profileRef);
    
    const profileData: any = {
      ...profile,
      userId,
      lastUpdated: Timestamp.now()
    };

    // Si le profil existe déjà, on merge seulement les nouvelles données
    if (existingProfile.exists()) {
      const existingData = existingProfile.data();
      await setDoc(profileRef, {
        ...existingData,
        ...profileData
      }, { merge: true });
    } else {
      // Créer un nouveau profil avec les valeurs par défaut
      await setDoc(profileRef, {
        preferences: {
          riskTolerance: 'medium',
          innovationLevel: 'incremental',
          preferredIndustries: [],
          opportunityWeights: {
            marketSize: 0.3,
            problemUrgency: 0.25,
            targetAudience: 0.2,
            competition: 0.15,
            timing: 0.1
          },
          feasibilityWeights: {
            technical: 0.3,
            financial: 0.25,
            resources: 0.2,
            timeline: 0.15,
            expertise: 0.1
          },
          timeHorizon: 'medium'
        },
        industryFocus: [],
        pastIdeaOutcomes: [],
        ...profileData
      });
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const profileRef = doc(this.userProfilesCollection, userId);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    
    // Create default profile if it doesn't exist
    const defaultProfile: UserProfile = {
      userId,
      preferences: {
        opportunityWeights: {
          marketSize: 0.3,
          problemUrgency: 0.25,
          targetAudience: 0.2,
          competition: 0.15,
          timing: 0.1
        },
        feasibilityWeights: {
          technical: 0.3,
          financial: 0.25,
          resources: 0.2,
          timeline: 0.15,
          expertise: 0.1
        },
        riskTolerance: 'medium',
        timeHorizon: 'medium'
      },
      industryFocus: [],
      pastIdeaOutcomes: [],
      historicalData: [],
      industryExpertise: [],
      lastUpdated: Timestamp.now()
    };

    await this.saveUserProfile(userId, defaultProfile);
    return defaultProfile;
  }

  async saveFeedback(ideaId: string, feedback: string, userId: string, rating?: number): Promise<void> {
    const feedbackRef = doc(this.feedbackCollection);
    await setDoc(feedbackRef, {
      ideaId,
      userId,
      feedback,
      rating,
      timestamp: Timestamp.now()
    });
  }

  async getFeedback(ideaId: string): Promise<Array<{feedback: string, rating?: number, timestamp: Timestamp}>> {
    const q = query(this.feedbackCollection, where('ideaId', '==', ideaId), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      feedback: doc.data().feedback,
      rating: doc.data().rating,
      timestamp: doc.data().timestamp
    }));
  }

  async saveIdeaOutcome(outcome: IdeaOutcome): Promise<void> {
    const outcomesRef = collection(db, 'ideaOutcomes');
    const outcomeRef = doc(outcomesRef);
    
    await setDoc(outcomeRef, {
      ...outcome,
      timestamp: Timestamp.now()
    });
  }

  async getHistoricalData(userId: string, limitCount: number = 100): Promise<TrainingData[]> {
    const outcomesRef = collection(db, 'ideaOutcomes');
    const ideasRef = collection(db, 'ideas');
    
    // Get user's ideas
    const ideasQuery = query(ideasRef, where('userId', '==', userId), limit(limitCount));
    const ideasSnapshot = await getDocs(ideasQuery);
    const ideaIds = ideasSnapshot.docs.map(doc => doc.id);
    
    // Get outcomes for these ideas
    const outcomesQuery = query(outcomesRef, where('ideaId', 'in', ideaIds.slice(0, 10)), limit(limitCount));
    const outcomesSnapshot = await getDocs(outcomesQuery);
    
    const trainingData: TrainingData[] = [];
    
    for (const outcomeDoc of outcomesSnapshot.docs) {
      const outcome = outcomeDoc.data() as IdeaOutcome;
      const ideaDoc = ideasSnapshot.docs.find(doc => doc.id === outcome.ideaId);
      
      if (ideaDoc && outcome.actualScore !== undefined) {
        const idea = ideaDoc.data() as Idea;
        const features = this.extractFeatures(idea);
        
        trainingData.push({
          features,
          label: outcome.outcome === 'success' ? 1 : 0
        });
      }
    }
    
    return trainingData;
  }

  private extractFeatures(idea: Idea): { [key: string]: number; } { // Fixed: Updated return type
    // Extract 12 numerical features from the idea for ML training
    const features: { [key: string]: number; } = {};
    // Example feature mapping (adjust based on your actual logic)
    features.marketSizeScore = idea.marketSize || 0;
    features.problemUrgencyScore = idea.problemUrgency || 0;
    features.targetAudienceScore = idea.targetAudience || 0;
    // Add remaining 9 features with appropriate keys
    features.problemUrgencyNormalized = idea.analysis?.problemUrgency ? idea.analysis.problemUrgency / 10 : 0.5;
    
    // 2. Target audience size (0-1)
    features.targetAudienceNormalized = idea.analysis?.targetAudience ? this.audienceToScore(idea.analysis.targetAudience) : 0.5;
    
    // 3. Competition level (0-1, inverted)
    features.competitionLevelInverted = idea.analysis?.competitionLevel ? (10 - idea.analysis.competitionLevel) / 10 : 0.5;
    
    // 4. Technical complexity (0-1, inverted)
    features.technicalComplexityInverted = idea.evaluation?.technicalComplexity ? (10 - idea.evaluation.technicalComplexity) / 10 : 0.5;
    
    // 5. Time to market (0-1, inverted)
    features.timeToMarketInverted = idea.evaluation?.timeToMarket ? (12 - idea.evaluation.timeToMarket) / 12 : 0.5;
    
    // 6. Resource requirements (0-1, inverted)
    features.resourceRequirementsInverted = idea.evaluation?.resourceRequirements ? (10 - idea.evaluation.resourceRequirements) / 10 : 0.5;
    
    // 7. Market timing (0-1)
    features.marketTimingNormalized = idea.evaluation?.marketTiming ? idea.evaluation.marketTiming / 10 : 0.5;
    
    // 8. Revenue potential (0-1)
    features.revenuePotentialNormalized = idea.evaluation?.revenuePotential ? idea.evaluation.revenuePotential / 10 : 0.5;
    
    // 9. Cost efficiency (0-1)
    features.costEfficiencyNormalized = idea.evaluation?.costEfficiency ? idea.evaluation.costEfficiency / 10 : 0.5;
    
    // 10. Scalability (0-1)
    features.scalabilityNormalized = idea.evaluation?.scalability ? idea.evaluation.scalability / 10 : 0.5;
    
    // 11. Risk level (0-1, inverted)
    features.riskLevelInverted = idea.evaluation?.riskLevel ? (10 - idea.evaluation.riskLevel) / 10 : 0.5;
    
    // 12. Innovation level (0-1)
    features.innovationLevelNormalized = idea.evaluation?.innovationLevel ? idea.evaluation.innovationLevel / 10 : 0.5;
    
    return features;
  }

  private audienceToScore(audience: string): number {
    const audienceMap: Record<string, number> = {
      'mass market': 1.0,
      'enterprise': 0.8,
      'smb': 0.7,
      'consumers': 0.9,
      'niche': 0.3,
      'b2b': 0.8,
      'b2c': 0.9
    };
    
    const lowerAudience = audience.toLowerCase();
    for (const [key, score] of Object.entries(audienceMap)) {
      if (lowerAudience.includes(key)) return score;
    }
    
    return 0.5;
  }

  async saveScoringResult(ideaId: string, scoringResult: ScoringResult): Promise<void> {
    const scoringRef = collection(db, 'scoringResults');
    const resultRef = doc(scoringRef);
    
    await setDoc(resultRef, {
      ideaId,
      ...scoringResult
    });
  }

  async getLatestScoringResult(ideaId: string): Promise<ScoringResult | null> {
    const scoringRef = collection(db, 'scoringResults');
    const q = query(scoringRef, where('ideaId', '==', ideaId), orderBy('timestamp', 'desc'), limit(1));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    return snapshot.docs[0].data() as ScoringResult;
  }
}

export const firebaseService = new FirebaseService();