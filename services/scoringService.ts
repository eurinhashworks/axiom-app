/**
 * Service de scoring avancé avec pondération adaptative
 * Implémente les algorithmes améliorés pour une meilleure précision
 */

import { Idea, IdeaEvaluation } from '../types';
import { UserProfile, CriteriaWeights, ScoringResult } from '../types/advanced';

export interface ScoreBreakdown {
  opportunity: {
    score: number;
    components: {
      problemUrgency: { value: number; weight: number; weighted: number };
      targetMarketSize: { value: number; weight: number; weighted: number };
      competitiveAdvantage: { value: number; weight: number; weighted: number };
    };
  };
  feasibility: {
    score: number;
    components: {
      personalAlignment: { value: number; weight: number; weighted: number };
      technicalFeasibility: { value: number; weight: number; weighted: number };
    };
  };
  confidence: number;
  recommendations: string[];
}

export class AdvancedScoringService {
  /**
   * Calcule les scores avec pondération adaptative selon le profil utilisateur
   */
  calculateAdaptiveScores(
    evaluation: IdeaEvaluation,
    userProfile?: UserProfile
  ): {
    opportunityScore: number;
    feasibilityScore: number;
    breakdown: ScoreBreakdown;
  } {
    // Poids par défaut (équilibrés)
    const defaultWeights = {
      opportunity: {
        problemUrgency: 0.35, // Plus important pour l'opportunité
        targetMarketSize: 0.35,
        competitiveAdvantage: 0.30,
      },
      feasibility: {
        personalAlignment: 0.40, // Plus important pour la faisabilité
        technicalFeasibility: 0.60,
      },
    };

    // Ajuster les poids selon le profil utilisateur
    const weights = this.adjustWeights(defaultWeights, userProfile);

    // Calcul score d'opportunité pondéré
    const opportunityComponents = {
      problemUrgency: {
        value: evaluation.problemUrgency,
        weight: weights.opportunity.problemUrgency,
        weighted: evaluation.problemUrgency * weights.opportunity.problemUrgency,
      },
      targetMarketSize: {
        value: evaluation.targetMarketSize,
        weight: weights.opportunity.targetMarketSize,
        weighted: evaluation.targetMarketSize * weights.opportunity.targetMarketSize,
      },
      competitiveAdvantage: {
        value: evaluation.competitiveAdvantage,
        weight: weights.opportunity.competitiveAdvantage,
        weighted: evaluation.competitiveAdvantage * weights.opportunity.competitiveAdvantage,
      },
    };

    // Normalisation : diviser par la somme des poids
    const opportunityWeightSum =
      weights.opportunity.problemUrgency +
      weights.opportunity.targetMarketSize +
      weights.opportunity.competitiveAdvantage;
    
    const opportunityScore =
      (opportunityComponents.problemUrgency.weighted +
        opportunityComponents.targetMarketSize.weighted +
        opportunityComponents.competitiveAdvantage.weighted) /
      opportunityWeightSum;

    // Calcul score de faisabilité pondéré
    const feasibilityComponents = {
      personalAlignment: {
        value: evaluation.personalAlignment,
        weight: weights.feasibility.personalAlignment,
        weighted: evaluation.personalAlignment * weights.feasibility.personalAlignment,
      },
      technicalFeasibility: {
        value: evaluation.technicalFeasibility,
        weight: weights.feasibility.technicalFeasibility,
        weighted: evaluation.technicalFeasibility * weights.feasibility.technicalFeasibility,
      },
    };

    const feasibilityWeightSum =
      weights.feasibility.personalAlignment + weights.feasibility.technicalFeasibility;
    
    const feasibilityScore =
      (feasibilityComponents.personalAlignment.weighted +
        feasibilityComponents.technicalFeasibility.weighted) /
      feasibilityWeightSum;

    // Calcul de la confiance (basé sur la cohérence des scores)
    const confidence = this.calculateConfidence(evaluation, opportunityScore, feasibilityScore);

    // Générer des recommandations
    const recommendations = this.generateRecommendations(
      evaluation,
      opportunityScore,
      feasibilityScore
    );

    return {
      opportunityScore: Math.round(opportunityScore * 10) / 10, // Arrondir à 1 décimale
      feasibilityScore: Math.round(feasibilityScore * 10) / 10,
      breakdown: {
        opportunity: {
          score: opportunityScore,
          components: opportunityComponents,
        },
        feasibility: {
          score: feasibilityScore,
          components: feasibilityComponents,
        },
        confidence,
        recommendations,
      },
    };
  }

  /**
   * Ajuste les poids selon le profil utilisateur
   */
  private adjustWeights(
    defaultWeights: any,
    userProfile?: UserProfile
  ): typeof defaultWeights {
    if (!userProfile || !userProfile.preferences) {
      return defaultWeights;
    }

    const adjusted = { ...defaultWeights };
    const prefs = userProfile.preferences;

    // Ajuster selon la tolérance au risque
    if (prefs.riskTolerance === 'low') {
      // Utilisateurs prudents : plus de poids sur la faisabilité
      adjusted.feasibility.technicalFeasibility *= 1.2;
      adjusted.feasibility.personalAlignment *= 1.1;
    } else if (prefs.riskTolerance === 'high') {
      // Utilisateurs audacieux : plus de poids sur l'opportunité
      adjusted.opportunity.problemUrgency *= 1.2;
      adjusted.opportunity.targetMarketSize *= 1.1;
    }

    // Ajuster selon les poids personnalisés si disponibles
    if (prefs.opportunityWeights) {
      const oppWeights = prefs.opportunityWeights;
      const oppSum = oppWeights.problemUrgency + oppWeights.marketSize + oppWeights.competition;
      if (oppSum > 0) {
        adjusted.opportunity.problemUrgency = oppWeights.problemUrgency / oppSum;
        adjusted.opportunity.targetMarketSize = oppWeights.marketSize / oppSum;
        adjusted.opportunity.competitiveAdvantage = oppWeights.competition / oppSum;
      }
    }

    if (prefs.feasibilityWeights) {
      const feaWeights = prefs.feasibilityWeights;
      const feaSum = feaWeights.technical + feaWeights.expertise;
      if (feaSum > 0) {
        adjusted.feasibility.technicalFeasibility = feaWeights.technical / feaSum;
        adjusted.feasibility.personalAlignment = feaWeights.expertise / feaSum;
      }
    }

    return adjusted;
  }

  /**
   * Calcule le niveau de confiance dans les scores
   */
  private calculateConfidence(
    evaluation: IdeaEvaluation,
    opportunityScore: number,
    feasibilityScore: number
  ): number {
    // Analyse de cohérence
    const scores = [
      evaluation.problemUrgency,
      evaluation.targetMarketSize,
      evaluation.competitiveAdvantage,
      evaluation.personalAlignment,
      evaluation.technicalFeasibility,
    ];

    // Calcul de l'écart-type (mesure de cohérence)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Confiance inversement proportionnelle à l'écart-type
    // Écart-type faible = scores cohérents = confiance élevée
    const baseConfidence = Math.max(0, 1 - stdDev / 10);

    // Bonus si les scores sont dans une plage réaliste
    const realisticRangeBonus = 
      (opportunityScore >= 3 && opportunityScore <= 9) &&
      (feasibilityScore >= 3 && feasibilityScore <= 9) 
        ? 0.1 : 0;

    // Détection d'incohérences logiques
    let inconsistencyPenalty = 0;
    if (evaluation.problemUrgency > 8 && evaluation.targetMarketSize < 3) {
      inconsistencyPenalty += 0.15; // Problème urgent mais marché très petit
    }
    if (evaluation.technicalFeasibility === 10 && evaluation.personalAlignment < 3) {
      inconsistencyPenalty += 0.1; // Techniquement faisable mais mal aligné
    }

    return Math.min(1, Math.max(0, baseConfidence + realisticRangeBonus - inconsistencyPenalty));
  }

  /**
   * Génère des recommandations basées sur les scores
   */
  private generateRecommendations(
    evaluation: IdeaEvaluation,
    opportunityScore: number,
    feasibilityScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Opportunité
    if (opportunityScore < 5) {
      recommendations.push(
        "Le score d'opportunité est faible. Concentrez-vous sur l'identification d'un problème plus urgent ou d'un marché plus large."
      );
    } else if (opportunityScore > 8) {
      recommendations.push(
        "Excellente opportunité ! Assurez-vous d'avoir les ressources nécessaires pour capitaliser rapidement."
      );
    }

    // Faisabilité
    if (feasibilityScore < 5) {
      recommendations.push(
        "La faisabilité est un défi. Considérez simplifier l'approche technique ou renforcer votre équipe."
      );
    } else if (feasibilityScore > 8) {
      recommendations.push(
        "Très faisable ! C'est une excellente idée pour démarrer rapidement."
      );
    }

    // Incohérences détectées
    if (evaluation.problemUrgency > 8 && evaluation.targetMarketSize < 3) {
      recommendations.push(
        "⚠️ Attention : Problème très urgent mais marché très petit. Vérifiez la viabilité économique."
      );
    }

    // Recommandations spécifiques par critère
    if (evaluation.problemUrgency < 4) {
      recommendations.push("Le problème semble peu urgent. Validez la vraie douleur des utilisateurs.");
    }
    if (evaluation.targetMarketSize < 4) {
      recommendations.push("Le marché semble limité. Explorez des segments adjacents ou des stratégies d'expansion.");
    }
    if (evaluation.competitiveAdvantage < 4) {
      recommendations.push("L'avantage concurrentiel est faible. Identifiez ce qui rend votre solution unique.");
    }
    if (evaluation.personalAlignment < 4) {
      recommendations.push("L'alignement personnel est faible. Assurez-vous que cette idée correspond à vos compétences et passions.");
    }
    if (evaluation.technicalFeasibility < 4) {
      recommendations.push("La faisabilité technique est un défi. Considérez une approche MVP plus simple.");
    }

    return recommendations;
  }

  /**
   * Valide la cohérence de l'évaluation
   */
  validateEvaluation(evaluation: IdeaEvaluation): {
    isValid: boolean;
    inconsistencies: Array<{ field: string; message: string; severity: 'low' | 'medium' | 'high' }>;
  } {
    const inconsistencies: Array<{ field: string; message: string; severity: 'low' | 'medium' | 'high' }> = [];

    // Vérification des scores extrêmes
    if (evaluation.problemUrgency > 8 && evaluation.targetMarketSize < 3) {
      inconsistencies.push({
        field: 'marketSize',
        message: 'Problème très urgent mais marché très petit - vérifiez la cohérence',
        severity: 'high',
      });
    }

    if (evaluation.technicalFeasibility === 10 && evaluation.personalAlignment < 3) {
      inconsistencies.push({
        field: 'personalAlignment',
        message: 'Techniquement faisable mais faible alignement personnel',
        severity: 'medium',
      });
    }

    // Tous les scores identiques (suspicion de manque de réflexion)
    const scores = [
      evaluation.problemUrgency,
      evaluation.targetMarketSize,
      evaluation.competitiveAdvantage,
      evaluation.personalAlignment,
      evaluation.technicalFeasibility,
    ];
    const allSame = scores.every(s => s === scores[0]);
    if (allSame && scores.length > 0) {
      inconsistencies.push({
        field: 'all',
        message: 'Tous les scores sont identiques - veuillez réfléchir plus en détail à chaque critère',
        severity: 'medium',
      });
    }

    return {
      isValid: inconsistencies.length === 0,
      inconsistencies,
    };
  }
}

export const advancedScoringService = new AdvancedScoringService();

