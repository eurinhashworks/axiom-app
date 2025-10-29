/**
 * Composant de guidance utilisateur avec indicateurs de progression
 * Affiche les prochaines étapes et actions suggérées
 */

import React from 'react';
import { Idea, IdeaStatus } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface UserGuidanceProps {
  idea: Idea;
  onAction?: (action: string) => void;
}

const GUIDANCE_BY_STATUS: Record<IdeaStatus, {
  title: string;
  description: string;
  actions: Array<{
    label: string;
    action: string;
    variant: 'primary' | 'secondary';
    icon?: string;
  }>;
  tips?: string[];
}> = {
  DRAFT: {
    title: 'Étape 1 : Décrivez votre idée',
    description: 'Commencez par décrire votre idée en détail. Plus vous êtes précis, meilleure sera l\'analyse.',
    actions: [
      { label: 'Commencer la saisie', action: 'start-input', variant: 'primary' },
    ],
    tips: [
      'Parlez du problème que vous résolvez',
      'Décrivez votre solution',
      'Identifiez votre public cible',
      'Expliquez ce qui vous différencie',
    ],
  },
  ANALYZING: {
    title: 'Analyse en cours...',
    description: 'L\'IA analyse votre idée. Cela ne prendra que quelques secondes.',
    actions: [],
    tips: [],
  },
  ANALYZED: {
    title: 'Étape 2 : Analysé ! Passons à l\'évaluation',
    description: 'Votre idée a été analysée. Passez maintenant à l\'évaluation stratégique pour obtenir des scores détaillés.',
    actions: [
      { label: 'Évaluer l\'idée', action: 'evaluate', variant: 'primary' },
      { label: 'Revoir l\'analyse', action: 'review-analysis', variant: 'secondary' },
    ],
    tips: [
      'Lisez attentivement les questions de clarification',
      'Considérez les risques potentiels',
      'Vous pourrez toujours revenir modifier votre idée',
    ],
  },
  EVALUATED: {
    title: 'Étape 3 : Évalué ! Générons votre roadmap',
    description: 'Votre idée a été évaluée. Créez maintenant une feuille de route pour transformer votre idée en plan d\'action.',
    actions: [
      { label: 'Générer la roadmap', action: 'generate-roadmap', variant: 'primary' },
      { label: 'Voir les scores', action: 'view-scores', variant: 'secondary' },
    ],
    tips: [
      'Les scores vous donnent une vue objective de votre idée',
      'Une roadmap vous aidera à passer à l\'action',
      'Vous pouvez toujours ré-évaluer après modifications',
    ],
  },
  ROADMAP_GENERATED: {
    title: 'Félicitations ! Votre roadmap est prête',
    description: 'Votre feuille de route est générée. Suivez les étapes pour transformer votre idée en réalité.',
    actions: [
      { label: 'Créer une nouvelle idée', action: 'new-idea', variant: 'primary' },
      { label: 'Retour au dashboard', action: 'dashboard', variant: 'secondary' },
      { label: 'Partager l\'idée', action: 'share', variant: 'secondary' },
    ],
    tips: [
      'Cochez les étapes au fur et à mesure de votre progression',
      'Vous pouvez modifier votre idée à tout moment',
      'Partagez votre idée pour obtenir des retours',
    ],
  },
};

const UserGuidance: React.FC<UserGuidanceProps> = ({ idea, onAction }) => {
  const guidance = GUIDANCE_BY_STATUS[idea.status];

  if (!guidance) return null;

  return (
    <Card className="mb-4 sm:mb-6 border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse flex-shrink-0"></span>
            <span className="break-words">{guidance.title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{guidance.description}</p>
        </div>

        {guidance.tips && guidance.tips.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">💡 Conseils :</p>
            <ul className="space-y-1">
              {guidance.tips.map((tip, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-brand mt-0.5 flex-shrink-0">•</span>
                  <span className="break-words">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {guidance.actions.length > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
            {guidance.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={() => onAction?.(action.action)}
                className="text-sm w-full sm:w-auto flex-1 sm:flex-initial"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserGuidance;

