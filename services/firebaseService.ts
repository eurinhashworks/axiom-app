import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Idea, Comment } from '../types';
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
  private commentsCollection = collection(db, 'comments');

  /**
   * Nettoie un objet en supprimant toutes les valeurs undefined
   * Firestore ne supporte pas les valeurs undefined
   */
  private cleanFirestoreData(data: any): any {
    if (data === null || data === undefined) {
      return null;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.cleanFirestoreData(item));
    }
    
    if (typeof data === 'object' && !(data instanceof Timestamp)) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Omettre les clés avec des valeurs undefined
        if (value !== undefined) {
          cleaned[key] = this.cleanFirestoreData(value);
        }
      }
      return cleaned;
    }
    
    return data;
  }

  async saveIdea(idea: Idea, userId: string, userData?: { displayName?: string | null; photoURL?: string | null }): Promise<string> {
    const ideaData: any = {
      ...idea,
      userId,
      createdAt: idea.createdAt ? Timestamp.fromMillis(idea.createdAt) : Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Si l'idée devient publique, ajouter les informations d'auteur
    if (idea.isPublic && userData) {
      ideaData.authorId = userId;
      ideaData.authorName = userData.displayName || 'Utilisateur anonyme';
      ideaData.authorPhotoURL = userData.photoURL || null;
    }

    // Nettoyer les données pour supprimer les valeurs undefined
    const cleanedData = this.cleanFirestoreData(ideaData);

    const ideaRef = idea.id 
      ? doc(this.ideasCollection, idea.id)
      : doc(this.ideasCollection);

    await setDoc(ideaRef, cleanedData, { merge: true });
    return ideaRef.id;
  }

  async deleteIdea(ideaId: string): Promise<void> {
    const ideaRef = doc(this.ideasCollection, ideaId);
    await deleteDoc(ideaRef);
  }

  async getIdeas(userId: string, limitCount?: number): Promise<Idea[]> {
    let q = query(this.ideasCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        status: data.status || 'DRAFT',
        brainDump: data.brainDump || '',
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis(),
        marketSize: data.marketSize || 0,
        problemUrgency: data.problemUrgency || 0,
        targetAudience: data.targetAudience || 0,
        analysis: data.analysis,
        evaluation: data.evaluation,
        roadmapSteps: data.roadmapSteps,
        opportunityScore: data.opportunityScore,
        feasibilityScore: data.feasibilityScore,
        isPublic: data.isPublic || false,
        authorId: data.authorId,
        authorName: data.authorName,
        authorPhotoURL: data.authorPhotoURL
      } as Idea;
    });
  }

  subscribeToIdeas(userId: string, callback: (ideas: Idea[]) => void): Unsubscribe {
    const q = query(this.ideasCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          status: data.status || 'DRAFT',
          brainDump: data.brainDump || '',
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis(),
          marketSize: data.marketSize || 0,
          problemUrgency: data.problemUrgency || 0,
          targetAudience: data.targetAudience || 0,
          analysis: data.analysis,
          evaluation: data.evaluation,
          roadmapSteps: data.roadmapSteps,
          opportunityScore: data.opportunityScore,
          feasibilityScore: data.feasibilityScore
        } as Idea;
      });
      callback(ideas);
    }, (error: any) => {
      // Ne pas logger les erreurs de réseau temporaires
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        return;
      }
      
      console.error('Error subscribing to ideas:', error);
    });
  }

  async getPublicIdeas(limitCount: number = 50): Promise<Idea[]> {
    // Utiliser une requête sans orderBy pour éviter le besoin d'un index composite
    // Le tri se fera côté client
    let q = query(
      this.ideasCollection,
      where('isPublic', '==', true)
    );
    
    // Limiter légèrement plus pour compenser le tri côté client
    if (limitCount) {
      q = query(q, limit(Math.min(limitCount * 2, 100)));
    }

    const snapshot = await getDocs(q);
    const ideas = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        status: data.status || 'DRAFT',
        brainDump: data.brainDump || '',
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis(),
        marketSize: data.marketSize || 0,
        problemUrgency: data.problemUrgency || 0,
        targetAudience: data.targetAudience || 0,
        analysis: data.analysis,
        evaluation: data.evaluation,
        roadmapSteps: data.roadmapSteps,
        opportunityScore: data.opportunityScore,
        feasibilityScore: data.feasibilityScore,
        isPublic: true,
        authorId: data.authorId || data.userId,
        authorName: data.authorName,
        authorPhotoURL: data.authorPhotoURL
      } as Idea;
    });
    
    // Trier côté client par date de création (plus récent en premier)
    ideas.sort((a, b) => b.createdAt - a.createdAt);
    
    // Limiter après le tri
    return limitCount ? ideas.slice(0, limitCount) : ideas;
  }

  subscribeToPublicIdeas(callback: (ideas: Idea[]) => void, limitCount: number = 20): Unsubscribe {
    // Utiliser une requête sans orderBy pour éviter le besoin d'un index composite
    // Le tri se fera côté client
    let q = query(
      this.ideasCollection,
      where('isPublic', '==', true),
      limit(limitCount || 20)
    );
    
    return onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          status: data.status || 'DRAFT',
          brainDump: data.brainDump || '',
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis(),
          marketSize: data.marketSize || 0,
          problemUrgency: data.problemUrgency || 0,
          targetAudience: data.targetAudience || 0,
          analysis: data.analysis,
          evaluation: data.evaluation,
          roadmapSteps: data.roadmapSteps,
          opportunityScore: data.opportunityScore,
          feasibilityScore: data.feasibilityScore,
          isPublic: true,
          authorId: data.authorId || data.userId,
          authorName: data.authorName,
          authorPhotoURL: data.authorPhotoURL
        } as Idea;
      });
      
      // Trier côté client par date de création (plus récent en premier)
      ideas.sort((a, b) => b.createdAt - a.createdAt);
      
      callback(ideas);
    }, (error: any) => {
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        return;
      }
      
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        return;
      }
      
      console.error('Error subscribing to public ideas:', error);
    });
  }

  // Méthode pour charger toutes les idées publiques (pour pagination côté client)
  async getAllPublicIdeas(): Promise<Idea[]> {
    try {
      const snapshot = await getDocs(
        query(
          this.ideasCollection,
          where('isPublic', '==', true),
          limit(200) // Limite Firestore
        )
      );

      const ideas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
      id: doc.id,
          title: data.title || '',
          status: data.status || 'DRAFT',
          brainDump: data.brainDump || '',
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis(),
          marketSize: data.marketSize || 0,
          problemUrgency: data.problemUrgency || 0,
          targetAudience: data.targetAudience || 0,
          analysis: data.analysis,
          evaluation: data.evaluation,
          roadmapSteps: data.roadmapSteps,
          opportunityScore: data.opportunityScore,
          feasibilityScore: data.feasibilityScore,
          isPublic: true,
          authorId: data.authorId || data.userId,
          authorName: data.authorName,
          authorPhotoURL: data.authorPhotoURL
        } as Idea;
      });

      // Trier côté client par date de création (plus récent en premier)
      ideas.sort((a, b) => b.createdAt - a.createdAt);
      
      return ideas;
    } catch (error: any) {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        return [];
      }
      throw error;
    }
  }

  async saveMarketAnalysis(ideaId: string, analysis: MarketAnalysis): Promise<void> {
    const analysisRef = doc(this.marketAnalysisCollection, ideaId);
    const data = {
      ...analysis,
      ideaId,
      timestamp: Timestamp.now()
    };
    await setDoc(analysisRef, this.cleanFirestoreData(data));
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
      const mergedData = {
        ...existingData,
        ...profileData
      };
      await setDoc(profileRef, this.cleanFirestoreData(mergedData), { merge: true });
    } else {
      // Créer un nouveau profil avec les valeurs par défaut
      const defaultData = {
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
      };
      await setDoc(profileRef, this.cleanFirestoreData(defaultData));
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileRef = doc(this.userProfilesCollection, userId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        return {
          userId: data.userId || userId,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          preferences: data.preferences || {
            riskTolerance: 'medium',
            innovationLevel: 'incremental',
            preferredIndustries: [],
          },
          industryFocus: data.industryFocus || [],
          pastIdeaOutcomes: data.pastIdeaOutcomes || [],
          historicalData: data.historicalData || [],
          industryExpertise: data.industryExpertise || [],
          riskTolerance: data.riskTolerance || 'medium',
          lastUpdated: data.lastUpdated,
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveFeedback(ideaId: string, feedback: string, userId: string, rating?: number): Promise<void> {
    const feedbackRef = doc(this.feedbackCollection);
    const feedbackData = {
      ideaId,
      userId,
      feedback,
      rating,
      timestamp: Timestamp.now()
    };
    await setDoc(feedbackRef, this.cleanFirestoreData(feedbackData));
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
    
    const data = {
      ...outcome,
      timestamp: Timestamp.now()
    };
    await setDoc(outcomeRef, this.cleanFirestoreData(data));
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
    
    const data = {
      ideaId,
      ...scoringResult
    };
    await setDoc(resultRef, this.cleanFirestoreData(data));
  }

  async getLatestScoringResult(ideaId: string): Promise<ScoringResult | null> {
    const scoringRef = collection(db, 'scoringResults');
    const q = query(scoringRef, where('ideaId', '==', ideaId), orderBy('timestamp', 'desc'), limit(1));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    return snapshot.docs[0].data() as ScoringResult;
  }

  // Méthodes pour les commentaires
  async addComment(ideaId: string, userId: string, userName: string, userPhotoURL: string | null, content: string): Promise<string> {
    const commentRef = doc(this.commentsCollection);
    const commentData = {
      ideaId,
      userId,
      userName,
      userPhotoURL: userPhotoURL || null,
      content: content.trim(),
      createdAt: Timestamp.now()
    };

    await setDoc(commentRef, this.cleanFirestoreData(commentData));
    return commentRef.id;
  }

  async getComments(ideaId: string): Promise<Comment[]> {
    const q = query(
      this.commentsCollection,
      where('ideaId', '==', ideaId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ideaId: data.ideaId,
        userId: data.userId,
        userName: data.userName,
        userPhotoURL: data.userPhotoURL,
        content: data.content,
        createdAt: data.createdAt?.toMillis() || Date.now()
      } as Comment;
    });
  }

  subscribeToComments(ideaId: string, callback: (comments: Comment[]) => void): Unsubscribe {
    const q = query(
      this.commentsCollection,
      where('ideaId', '==', ideaId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ideaId: data.ideaId,
          userId: data.userId,
          userName: data.userName,
          userPhotoURL: data.userPhotoURL,
          content: data.content,
          createdAt: data.createdAt?.toMillis() || Date.now()
        } as Comment;
      });
      callback(comments);
    }, (error: any) => {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        return;
      }
      console.error('Error subscribing to comments:', error);
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const commentRef = doc(this.commentsCollection, commentId);
    await deleteDoc(commentRef);
  }
}

export const firebaseService = new FirebaseService();