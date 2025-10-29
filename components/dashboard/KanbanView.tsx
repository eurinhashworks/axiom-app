import React from 'react';
import { Idea } from '../../types';
import IdeaCard from './IdeaCard';

interface KanbanViewProps {
    ideas: Idea[];
    onSelectIdea: (idea: Idea) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ ideas, onSelectIdea }) => {
    const columns = [
        { id: 'DRAFT', title: 'Brouillons', color: 'bg-gray-100 dark:bg-gray-800' },
        { id: 'ANALYZING', title: 'En analyse', color: 'bg-blue-100 dark:bg-blue-900' },
        { id: 'ANALYZED', title: 'Analysées', color: 'bg-yellow-100 dark:bg-yellow-900' },
        { id: 'EVALUATED', title: 'Évaluées', color: 'bg-orange-100 dark:bg-orange-900' },
        { id: 'ROADMAP_GENERATED', title: 'Roadmaps', color: 'bg-green-100 dark:bg-green-900' }
    ];

    const getIdeasForColumn = (status: string) => {
        return ideas.filter(idea => idea.status === status);
    };

    return (
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-4 px-4 snap-x snap-mandatory">
            {columns.map(column => {
                const columnIdeas = getIdeasForColumn(column.id);
                
                return (
                    <div key={column.id} className="flex-shrink-0 w-[calc(100vw-3rem)] sm:w-80 snap-start">
                        <div className={`${column.color} rounded-lg p-3 sm:p-4 min-h-[400px] sm:min-h-96`}>
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h3 className="font-semibold text-base sm:text-lg">{column.title}</h3>
                                <span className="bg-white dark:bg-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                                    {columnIdeas.length}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                {columnIdeas.length > 0 ? (
                                    columnIdeas.map(idea => (
                                        <div key={idea.id} className="transform transition-transform hover:scale-105">
                                            <IdeaCard 
                                                idea={idea} 
                                                onSelect={() => onSelectIdea(idea)}
                                                compact={true}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-sm">Aucune idée</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanView;
