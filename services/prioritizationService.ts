import { Idea } from '../types';

export interface PriorityScore {
  overall: number;
  urgency: number;
  impact: number;
  effort: number;
  readiness: number;
}

export interface PrioritizedIdea extends Idea {
  priorityScore: PriorityScore;
  priorityLevel: 'high' | 'medium' | 'low';
  recommendedAction: string;
  estimatedTimeline: string;
  nextSteps: string[];
}

export interface TimelineItem {
  id: string;
  idea: PrioritizedIdea;
  phase: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  timeframe: string;
  priority: number;
  dependencies: string[];
  blockers: string[];
}

class PrioritizationService {
  /**
   * Calcule le score de priorité global d'une idée
   */
  calculatePriorityScore(idea: Idea): PriorityScore {
    // Score d'urgence (0-10) - basé sur l'opportunité et la concurrence
    const urgency = this.calculateUrgencyScore(idea);
    
    // Score d'impact (0-10) - basé sur le potentiel de marché et l'alignement personnel
    const impact = this.calculateImpactScore(idea);
    
    // Score d'effort (0-10, inversé - plus c'est facile, plus le score est élevé)
    const effort = this.calculateEffortScore(idea);
    
    // Score de préparation (0-10) - basé sur l'état de développement
    const readiness = this.calculateReadinessScore(idea);
    
    // Score global pondéré
    const overall = (urgency * 0.3) + (impact * 0.35) + (effort * 0.2) + (readiness * 0.15);
    
    return {
      overall: Math.round(overall * 10) / 10,
      urgency,
      impact,
      effort,
      readiness
    };
  }

  /**
   * Calcule le score d'urgence basé sur l'opportunité et les facteurs temporels
   */
  private calculateUrgencyScore(idea: Idea): number {
    let score = 0;
    
    // Score d'opportunité (40% du score d'urgence)
    if (idea.opportunityScore !== undefined) {
      score += idea.opportunityScore * 0.4;
    }
    
    // Facteur temporel (30% du score d'urgence)
    const daysSinceCreation = (Date.now() - idea.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) {
      score += 8; // Très récent
    } else if (daysSinceCreation < 30) {
      score += 6; // Récent
    } else if (daysSinceCreation < 90) {
      score += 4; // Modéré
    } else {
      score += 2; // Ancien
    }
    
    // État d'avancement (30% du score d'urgence)
    switch (idea.status) {
      case 'DRAFT':
        score += 3; // Pas encore commencé
        break;
      case 'ANALYZING':
        score += 5; // En cours d'analyse
        break;
      case 'ANALYZED':
        score += 7; // Prêt pour l'évaluation
        break;
      case 'EVALUATED':
        score += 8; // Prêt pour la roadmap
        break;
      case 'ROADMAP_GENERATED':
        score += 9; // Prêt à être exécuté
        break;
    }
    
    return Math.min(score, 10);
  }

  /**
   * Calcule le score d'impact basé sur le potentiel de marché et l'alignement
   */
  private calculateImpactScore(idea: Idea): number {
    let score = 0;
    
    // Score d'opportunité (50% du score d'impact)
    if (idea.opportunityScore !== undefined) {
      score += idea.opportunityScore * 0.5;
    }
    
    // Score de faisabilité (30% du score d'impact)
    if (idea.feasibilityScore !== undefined) {
      score += idea.feasibilityScore * 0.3;
    }
    
    // Facteur de nouveauté (20% du score d'impact)
    const isNew = idea.status === 'DRAFT' || idea.status === 'ANALYZING';
    if (isNew) {
      score += 2; // Bonus pour les nouvelles idées
    }
    
    return Math.min(score, 10);
  }

  /**
   * Calcule le score d'effort (inversé - plus c'est facile, plus le score est élevé)
   */
  private calculateEffortScore(idea: Idea): number {
    let score = 0;
    
    // Score de faisabilité (60% du score d'effort)
    if (idea.feasibilityScore !== undefined) {
      score += idea.feasibilityScore * 0.6;
    }
    
    // Complexité technique basée sur les technologies recommandées (40% du score d'effort)
    if (idea.evaluation?.recommendedTechnologies) {
      const techComplexity = this.calculateTechComplexity(idea.evaluation.recommendedTechnologies);
      score += (10 - techComplexity) * 0.4; // Inversé
    } else {
      score += 5; // Score neutre si pas d'évaluation
    }
    
    return Math.min(score, 10);
  }

  /**
   * Calcule le score de préparation basé sur l'état de développement
   */
  private calculateReadinessScore(idea: Idea): number {
    let score = 0;
    
    // État d'avancement (70% du score de préparation)
    switch (idea.status) {
      case 'DRAFT':
        score += 2;
        break;
      case 'ANALYZING':
        score += 3;
        break;
      case 'ANALYZED':
        score += 5;
        break;
      case 'EVALUATED':
        score += 7;
        break;
      case 'ROADMAP_GENERATED':
        score += 9;
        break;
    }
    
    // Présence de roadmap (30% du score de préparation)
    if (idea.roadmapSteps && idea.roadmapSteps.length > 0) {
      score += 3;
    }
    
    return Math.min(score, 10);
  }

  /**
   * Calcule la complexité technique des technologies recommandées
   */
  private calculateTechComplexity(technologies: any[]): number {
    const complexityMap: { [key: string]: number } = {
      'easy': 2,
      'medium': 5,
      'hard': 8
    };
    
    const avgComplexity = technologies.reduce((sum, tech) => {
      return sum + (complexityMap[tech.difficulty] || 5);
    }, 0) / technologies.length;
    
    return avgComplexity;
  }

  /**
   * Détermine le niveau de priorité basé sur le score global
   */
  getPriorityLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 7.5) return 'high';
    if (score >= 5.5) return 'medium';
    return 'low';
  }

  /**
   * Génère l'action recommandée pour une idée
   */
  getRecommendedAction(idea: Idea, priorityScore: PriorityScore): string {
    switch (idea.status) {
      case 'DRAFT':
        return 'Commencer l\'analyse de l\'idée';
      case 'ANALYZING':
        return 'Attendre la fin de l\'analyse';
      case 'ANALYZED':
        return 'Procéder à l\'évaluation stratégique';
      case 'EVALUATED':
        return 'Générer la feuille de route';
      case 'ROADMAP_GENERATED':
        if (priorityScore.overall >= 8) {
          return 'Commencer l\'exécution immédiatement';
        } else if (priorityScore.overall >= 6) {
          return 'Planifier l\'exécution cette semaine';
        } else {
          return 'Planifier l\'exécution ce mois-ci';
        }
      default:
        return 'Continuer le développement';
    }
  }

  /**
   * Estime le timeline pour une idée
   */
  getEstimatedTimeline(idea: Idea, priorityScore: PriorityScore): string {
    const baseTime = this.getBaseTimeline(idea.status);
    const priorityMultiplier = this.getPriorityMultiplier(priorityScore.overall);
    
    const estimatedDays = Math.round(baseTime * priorityMultiplier);
    
    if (estimatedDays <= 1) return 'Aujourd\'hui';
    if (estimatedDays <= 7) return 'Cette semaine';
    if (estimatedDays <= 30) return 'Ce mois-ci';
    if (estimatedDays <= 90) return 'Ce trimestre';
    return 'Cette année';
  }

  private getBaseTimeline(status: string): number {
    switch (status) {
      case 'DRAFT': return 3; // 3 jours pour analyser
      case 'ANALYZING': return 1; // 1 jour pour attendre
      case 'ANALYZED': return 2; // 2 jours pour évaluer
      case 'EVALUATED': return 1; // 1 jour pour roadmap
      case 'ROADMAP_GENERATED': return 7; // 1 semaine pour commencer
      default: return 5;
    }
  }

  private getPriorityMultiplier(score: number): number {
    if (score >= 8) return 0.5; // Très prioritaire = plus rapide
    if (score >= 6) return 0.8; // Prioritaire = rapide
    if (score >= 4) return 1.2; // Moyen = normal
    return 1.5; // Faible = plus lent
  }

  /**
   * Génère les prochaines étapes pour une idée
   */
  getNextSteps(idea: Idea): string[] {
    const steps: string[] = [];
    
    switch (idea.status) {
      case 'DRAFT':
        steps.push('Décrire l\'idée en détail');
        steps.push('Lancer l\'analyse automatique');
        break;
      case 'ANALYZED':
        steps.push('Répondre aux questions de clarification');
        steps.push('Lancer l\'évaluation stratégique');
        break;
      case 'EVALUATED':
        steps.push('Examiner les scores et recommandations');
        steps.push('Générer la feuille de route');
        break;
      case 'ROADMAP_GENERATED':
        steps.push('Examiner les étapes de la roadmap');
        steps.push('Commencer la première étape');
        steps.push('Définir les ressources nécessaires');
        break;
    }
    
    return steps;
  }

  /**
   * Priorise toutes les idées et crée un timeline
   */
  prioritizeIdeas(ideas: Idea[]): {
    prioritizedIdeas: PrioritizedIdea[];
    timeline: TimelineItem[];
    recommendations: {
      immediate: PrioritizedIdea[];
      thisWeek: PrioritizedIdea[];
      thisMonth: PrioritizedIdea[];
      later: PrioritizedIdea[];
    };
  } {
    // Calculer les scores de priorité pour toutes les idées
    const prioritizedIdeas: PrioritizedIdea[] = ideas.map(idea => {
      const priorityScore = this.calculatePriorityScore(idea);
      const priorityLevel = this.getPriorityLevel(priorityScore.overall);
      const recommendedAction = this.getRecommendedAction(idea, priorityScore);
      const estimatedTimeline = this.getEstimatedTimeline(idea, priorityScore);
      const nextSteps = this.getNextSteps(idea);
      
      return {
        ...idea,
        priorityScore,
        priorityLevel,
        recommendedAction,
        estimatedTimeline,
        nextSteps
      };
    });

    // Trier par score de priorité décroissant
    prioritizedIdeas.sort((a, b) => b.priorityScore.overall - a.priorityScore.overall);

    // Créer le timeline
    const timeline: TimelineItem[] = prioritizedIdeas.map((idea, index) => {
      const phase = this.determinePhase(idea, index);
      const timeframe = this.getTimeframe(phase);
      const dependencies = this.getDependencies(idea, prioritizedIdeas);
      const blockers = this.getBlockers(idea);
      
      return {
        id: idea.id,
        idea,
        phase,
        timeframe,
        priority: index + 1,
        dependencies,
        blockers
      };
    });

    // Organiser par recommandations
    const recommendations = {
      immediate: prioritizedIdeas.filter(idea => 
        idea.priorityLevel === 'high' && idea.status === 'ROADMAP_GENERATED'
      ),
      thisWeek: prioritizedIdeas.filter(idea => 
        idea.priorityLevel === 'high' && idea.status !== 'ROADMAP_GENERATED'
      ),
      thisMonth: prioritizedIdeas.filter(idea => 
        idea.priorityLevel === 'medium'
      ),
      later: prioritizedIdeas.filter(idea => 
        idea.priorityLevel === 'low'
      )
    };

    return {
      prioritizedIdeas,
      timeline,
      recommendations
    };
  }

  private determinePhase(idea: PrioritizedIdea, index: number): 'immediate' | 'short-term' | 'medium-term' | 'long-term' {
    if (idea.priorityLevel === 'high' && idea.status === 'ROADMAP_GENERATED') {
      return 'immediate';
    }
    if (idea.priorityLevel === 'high') {
      return 'short-term';
    }
    if (idea.priorityLevel === 'medium') {
      return 'medium-term';
    }
    return 'long-term';
  }

  private getTimeframe(phase: string): string {
    switch (phase) {
      case 'immediate': return 'Aujourd\'hui';
      case 'short-term': return 'Cette semaine';
      case 'medium-term': return 'Ce mois-ci';
      case 'long-term': return 'Ce trimestre';
      default: return 'Plus tard';
    }
  }

  private getDependencies(idea: PrioritizedIdea, allIdeas: PrioritizedIdea[]): string[] {
    // Logique simple : les idées avec un score plus élevé sont des dépendances
    return allIdeas
      .filter(otherIdea => 
        otherIdea.id !== idea.id && 
        otherIdea.priorityScore.overall > idea.priorityScore.overall
      )
      .map(otherIdea => otherIdea.title)
      .slice(0, 2); // Limiter à 2 dépendances
  }

  private getBlockers(idea: PrioritizedIdea): string[] {
    const blockers: string[] = [];
    
    if (idea.status === 'DRAFT') {
      blockers.push('Idée pas encore analysée');
    }
    if (idea.status === 'ANALYZED' && !idea.clarifyingAnswers) {
      blockers.push('Questions de clarification non répondues');
    }
    if (idea.status === 'EVALUATED' && !idea.roadmapSteps) {
      blockers.push('Feuille de route non générée');
    }
    
    return blockers;
  }
}

export const prioritizationService = new PrioritizationService();
