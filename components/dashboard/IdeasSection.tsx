import React from 'react';
import { Idea } from '../../types';
import EmptyState from '../ui/EmptyState';
import CompactView from './CompactView';
import DetailView from './DetailView';
import IdeaCardEnhanced from './IdeaCardEnhanced';

export type IdeasViewMode = 'grid' | 'detail' | 'compact';

interface IdeasSectionProps {
    ideas: Idea[];
    viewMode: IdeasViewMode;
    selectedIds: Set<string>;
    onToggleSelection: (ideaId: string) => void;
    onSelectIdea: (idea: Idea) => void;
    title?: string;
    isFilteredOrSearched?: boolean;
    onNewIdea?: () => void;
}

const IdeasSection: React.FC<IdeasSectionProps> = ({
    ideas,
    viewMode,
    selectedIds,
    onToggleSelection,
    onSelectIdea,
    title = 'Toutes les idées',
    isFilteredOrSearched = false,
    onNewIdea
}) => {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            {ideas.length > 0 ? (
                <>
                    {viewMode === 'compact' && (
                        <CompactView 
                            ideas={ideas} 
                            onSelectIdea={onSelectIdea} 
                        />
                    )}
                    {viewMode === 'detail' && (
                        <DetailView 
                            ideas={ideas} 
                            onSelectIdea={onSelectIdea} 
                        />
                    )}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {ideas.map(idea => (
                                <IdeaCardEnhanced 
                                    key={idea.id} 
                                    idea={idea} 
                                    onSelect={() => onSelectIdea(idea)}
                                    showSelection={true}
                                    isSelected={selectedIds.has(idea.id)}
                                    onToggleSelection={() => onToggleSelection(idea.id)}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <EmptyState
                    title={isFilteredOrSearched ? 'Aucune idée correspondante' : 'Aucune idée pour le moment'}
                    description={
                        isFilteredOrSearched
                            ? 'Essayez de modifier vos critères de recherche ou de filtres.'
                            : "Commencez à transformer vos idées en opportunités stratégiques. Créez votre première idée pour démarrer l'analyse."
                    }
                    action={!isFilteredOrSearched && onNewIdea ? { label: '+ Nouvelle Idée', onClick: onNewIdea } : undefined}
                />
            )}
        </div>
    );
};

export default IdeasSection;
