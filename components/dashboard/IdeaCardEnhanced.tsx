import React, { useState } from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import StatusBadge from './StatusBadge';
import { useIdeas } from '../../contexts/IdeasContext';

interface IdeaCardEnhancedProps {
    idea: Idea;
    onSelect: () => void;
    compact?: boolean;
    showSelection?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
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

const IdeaCardEnhanced: React.FC<IdeaCardEnhancedProps> = ({ 
    idea, 
    onSelect, 
    compact = false, 
    showSelection = false,
    isSelected = false,
    onToggleSelection 
}) => {
    const { deleteIdea } = useIdeas();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteIdea(idea.id);
        } catch (error) {
            console.error('Error deleting idea:', error);
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

    const handleSelectionToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelection?.();
    };

    if (compact) {
        return (
            <Card 
                className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={handleCardClick}
            >
                <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-brand transition-colors">
                            {idea.title}
                        </h3>
                        {showSelection && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={handleSelectionToggle}
                                className="ml-2"
                            />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {idea.analysis?.summary || idea.brainDump}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                        <StatusBadge status={idea.status} />
                        {idea.opportunityScore !== undefined && idea.feasibilityScore !== undefined && (
                            <div className="flex gap-1 text-xs">
                                <span className="text-green-600 dark:text-green-400">
                                    O: {idea.opportunityScore.toFixed(1)}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400">
                                    F: {idea.feasibilityScore.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card 
            className="flex flex-col justify-between hover:shadow-xl hover:border-brand transition-all cursor-pointer h-full group relative overflow-hidden"
            onClick={handleCardClick}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/0 group-hover:from-brand/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-brand transition-colors flex-1">
                                {idea.title}
                            </h3>
                            {idea.isFavorite && (
                                <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={idea.status} />
                            {idea.isPublic && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Publique
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {showSelection && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={handleSelectionToggle}
                                className="ml-2"
                            />
                        )}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(true);
                                }}
                                className="text-muted-foreground hover:text-red-500 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label="Supprimer l'idée"
                                title="Supprimer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 group-hover:text-foreground transition-colors">
                    {idea.analysis?.summary || idea.brainDump}
                </p>
            </div>

            <div className="relative z-10 mt-auto">
                <div className="flex flex-wrap gap-2 mb-3">
                    <ScorePill label="Opp" score={idea.opportunityScore} />
                    <ScorePill label="Fais" score={idea.feasibilityScore} />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-muted-foreground">
                    <span>
                        {new Date(idea.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </span>
                    {idea.roadmapSteps && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {idea.roadmapSteps.length} étapes
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default IdeaCardEnhanced;
