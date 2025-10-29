import React, { useState } from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import StatusBadge from './StatusBadge';
import { useIdeas } from '../../contexts/IdeasContext';

interface IdeaCardProps {
    idea: Idea;
    onSelect: () => void;
}

const ScorePill: React.FC<{ label: string, score?: number }> = ({ label, score }) => {
    if (score === undefined || score === 0) return null;
    
    const getColor = (s: number) => {
        if (s > 7) return 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
        if (s > 4) return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
        return 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
    }

    return (
        <div className={`text-xs px-2 py-1 rounded-full font-semibold transition-all ${getColor(score)}`}>
            {label}: <strong>{score.toFixed(1)}</strong>
        </div>
    )
};

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onSelect }) => {
    const { deleteIdea } = useIdeas();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }
        
        try {
            await deleteIdea(idea.id);
            // Le toast est déjà géré dans IdeasContext
        } catch (error) {
            console.error('Error deleting idea:', error);
            // Le toast d'erreur est déjà géré dans IdeasContext
        }
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    const handleCardClick = () => {
        onSelect();
    };

    return (
        <Card 
            className="flex flex-col justify-between hover:shadow-xl hover:border-brand transition-all cursor-pointer h-full group relative overflow-hidden"
            onClick={handleCardClick}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/0 group-hover:from-brand/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground pr-2 group-hover:text-brand transition-colors flex-1">
                        {idea.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={idea.status} />
                        {showDeleteConfirm ? (
                            <div className="flex gap-1 animate-scale-in">
                                <button 
                                    onClick={handleDelete} 
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label="Confirmer la suppression"
                                    title="Confirmer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </button>
                                <button 
                                    onClick={handleCancelDelete} 
                                    className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                                    aria-label="Annuler la suppression"
                                    title="Annuler"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleDelete} 
                                className="text-muted-foreground hover:text-destructive p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive"
                                aria-label="Supprimer l'idée"
                                title="Supprimer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {idea.analysis?.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {idea.analysis.summary}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 relative z-10">
               <ScorePill label="Opportunité" score={idea.opportunityScore} />
               <ScorePill label="Faisabilité" score={idea.feasibilityScore} />
            </div>
        </Card>
    );
};

export default IdeaCard;