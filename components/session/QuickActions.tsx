/**
 * Composant d'actions rapides contextuelles
 * Affiche des actions rapides selon le contexte de l'idée
 */

import React from 'react';
import { Idea } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface QuickActionsProps {
  idea: Idea;
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ idea, onAction }) => {
  const actions = [];

  // Actions selon le statut
  if (idea.status === 'ANALYZED') {
    actions.push({
      label: 'Évaluer maintenant',
      action: 'evaluate',
      icon: '📊',
      variant: 'primary' as const,
    });
  }

  if (idea.status === 'EVALUATED') {
    actions.push({
      label: 'Générer roadmap',
      action: 'generate-roadmap',
      icon: '🗺️',
      variant: 'primary' as const,
    });
  }

  if (idea.status === 'ROADMAP_GENERATED') {
    actions.push({
      label: 'Créer nouvelle idée',
      action: 'new-idea',
      icon: '➕',
      variant: 'primary' as const,
    });
    actions.push({
      label: 'Partager publiquement',
      action: 'share',
      icon: '🌐',
      variant: 'secondary' as const,
    });
  }

  // Actions toujours disponibles
  actions.push({
    label: 'Modifier',
    action: 'edit',
    icon: '✏️',
    variant: 'secondary' as const,
  });

  actions.push({
    label: 'Exporter',
    action: 'export',
    icon: '📥',
    variant: 'secondary' as const,
  });

  if (actions.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-muted-foreground">Actions rapides</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            onClick={() => onAction(action.action)}
            className="text-xs"
          >
            <span className="mr-1">{action.icon}</span>
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;

