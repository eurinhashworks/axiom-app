import React from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';

interface CompactViewProps {
    ideas: Idea[];
    onSelectIdea: (idea: Idea) => void;
}

const CompactView: React.FC<CompactViewProps> = ({ ideas, onSelectIdea }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'text-gray-600 dark:text-gray-400';
            case 'ANALYZING': return 'text-blue-600 dark:text-blue-400';
            case 'ANALYZED': return 'text-yellow-600 dark:text-yellow-400';
            case 'EVALUATED': return 'text-orange-600 dark:text-orange-400';
            case 'ROADMAP_GENERATED': return 'text-green-600 dark:text-green-400';
            default: return 'text-muted-foreground';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Brouillon';
            case 'ANALYZING': return 'Analyse';
            case 'ANALYZED': return 'Analysé';
            case 'EVALUATED': return 'Évalué';
            case 'ROADMAP_GENERATED': return 'Roadmap';
            default: return status;
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left p-2 sm:p-3 font-semibold text-sm">Titre</th>
                            <th className="text-left p-2 sm:p-3 font-semibold text-sm hidden sm:table-cell">Statut</th>
                            <th className="text-left p-2 sm:p-3 font-semibold text-sm">Scores</th>
                            <th className="text-left p-2 sm:p-3 font-semibold text-sm hidden md:table-cell">Date</th>
                            <th className="text-left p-2 sm:p-3 font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ideas.map(idea => (
                            <tr 
                                key={idea.id} 
                                className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => onSelectIdea(idea)}
                            >
                                <td className="p-2 sm:p-3">
                                    <div className="flex items-center gap-2">
                                        {idea.isFavorite && (
                                            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm sm:text-base truncate">{idea.title}</div>
                                            <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                                {idea.analysis?.summary || idea.brainDump}
                                            </div>
                                            <span className={`sm:hidden text-xs font-medium mt-1 inline-block ${getStatusColor(idea.status)}`}>
                                                {getStatusLabel(idea.status)}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2 sm:p-3 hidden sm:table-cell">
                                    <span className={`text-sm font-medium ${getStatusColor(idea.status)}`}>
                                        {getStatusLabel(idea.status)}
                                    </span>
                                </td>
                                <td className="p-2 sm:p-3">
                                    {idea.opportunityScore !== undefined && idea.feasibilityScore !== undefined ? (
                                        <div className="flex gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
                                            <span className="text-green-600 dark:text-green-400">
                                                O: {idea.opportunityScore.toFixed(1)}
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400">
                                                F: {idea.feasibilityScore.toFixed(1)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-xs sm:text-sm">-</span>
                                    )}
                                </td>
                                <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                                    {formatDate(idea.createdAt)}
                                </td>
                                <td className="p-2 sm:p-3">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectIdea(idea);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                            title="Voir détails"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default CompactView;
