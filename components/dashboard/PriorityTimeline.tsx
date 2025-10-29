import React, { useState } from 'react';
import { PrioritizedIdea, TimelineItem } from '../../services/prioritizationService';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PriorityTimelineProps {
  prioritizedIdeas: PrioritizedIdea[];
  timeline: TimelineItem[];
  recommendations: {
    immediate: PrioritizedIdea[];
    thisWeek: PrioritizedIdea[];
    thisMonth: PrioritizedIdea[];
    later: PrioritizedIdea[];
  };
  onSelectIdea: (idea: PrioritizedIdea) => void;
}

const PriorityTimeline: React.FC<PriorityTimelineProps> = ({
  prioritizedIdeas,
  timeline,
  recommendations,
  onSelectIdea
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'recommendations'>('timeline');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'immediate': return 'bg-red-500';
      case 'short-term': return 'bg-orange-500';
      case 'medium-term': return 'bg-yellow-500';
      case 'long-term': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'immediate': return 'Immédiat';
      case 'short-term': return 'Court terme';
      case 'medium-term': return 'Moyen terme';
      case 'long-term': return 'Long terme';
      default: return phase;
    }
  };

  const filteredTimeline = selectedPhase === 'all' 
    ? timeline 
    : timeline.filter(item => item.phase === selectedPhase);

  const phases = ['all', 'immediate', 'short-term', 'medium-term', 'long-term'];

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Timeline des Priorités</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Plan d'action automatique pour optimiser votre productivité
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'timeline' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('timeline')}
              className="text-sm"
            >
              Timeline
            </Button>
            <Button
              variant={activeTab === 'recommendations' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('recommendations')}
              className="text-sm"
            >
              Recommandations
            </Button>
          </div>
        </div>

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* Filtres de phase */}
            <div className="flex flex-wrap gap-2">
              {phases.map(phase => (
                <button
                  key={phase}
                  onClick={() => setSelectedPhase(phase)}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-all ${
                    selectedPhase === phase
                      ? 'bg-brand text-white'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {phase === 'all' ? 'Toutes' : getPhaseLabel(phase)}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              {filteredTimeline.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onSelectIdea(item.idea)}
                >
                  {/* Indicateur de priorité */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPhaseColor(item.phase)}`}></div>
                    <span className="text-xs font-bold text-muted-foreground">#{item.priority}</span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{item.idea.title}</h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.idea.priorityLevel)}`}>
                          {item.idea.priorityLevel.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.timeframe}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {item.idea.recommendedAction}
                    </p>

                    {/* Scores */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Urgence: {item.idea.priorityScore.urgency.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Impact: {item.idea.priorityScore.impact.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Facilité: {item.idea.priorityScore.effort.toFixed(1)}
                      </span>
                    </div>

                    {/* Dépendances et blocages */}
                    {(item.dependencies.length > 0 || item.blockers.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.dependencies.length > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            📋 Dépend de: {item.dependencies.join(', ')}
                          </div>
                        )}
                        {item.blockers.length > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            ⚠️ Bloqué par: {item.blockers.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Immédiat */}
            {recommendations.immediate.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  À faire immédiatement
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.immediate.map(idea => (
                    <div
                      key={idea.id}
                      className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      onClick={() => onSelectIdea(idea)}
                    >
                      <h4 className="font-semibold text-sm mb-1">{idea.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{idea.recommendedAction}</p>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        Score: {idea.priorityScore.overall.toFixed(1)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cette semaine */}
            {recommendations.thisWeek.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  Cette semaine
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.thisWeek.map(idea => (
                    <div
                      key={idea.id}
                      className="p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                      onClick={() => onSelectIdea(idea)}
                    >
                      <h4 className="font-semibold text-sm mb-1">{idea.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{idea.recommendedAction}</p>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Score: {idea.priorityScore.overall.toFixed(1)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ce mois-ci */}
            {recommendations.thisMonth.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  Ce mois-ci
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.thisMonth.map(idea => (
                    <div
                      key={idea.id}
                      className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
                      onClick={() => onSelectIdea(idea)}
                    >
                      <h4 className="font-semibold text-sm mb-1">{idea.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{idea.recommendedAction}</p>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        Score: {idea.priorityScore.overall.toFixed(1)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plus tard */}
            {recommendations.later.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Plus tard
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.later.map(idea => (
                    <div
                      key={idea.id}
                      className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                      onClick={() => onSelectIdea(idea)}
                    >
                      <h4 className="font-semibold text-sm mb-1">{idea.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{idea.recommendedAction}</p>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Score: {idea.priorityScore.overall.toFixed(1)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PriorityTimeline;
