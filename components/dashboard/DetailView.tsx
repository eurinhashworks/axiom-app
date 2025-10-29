import React from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface DetailViewProps {
    ideas: Idea[];
    onSelectIdea: (idea: Idea) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ ideas, onSelectIdea }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
            case 'ANALYZING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'ANALYZED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'EVALUATED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'ROADMAP_GENERATED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Brouillon';
            case 'ANALYZING': return 'En analyse';
            case 'ANALYZED': return 'Analysé';
            case 'EVALUATED': return 'Évalué';
            case 'ROADMAP_GENERATED': return 'Roadmap générée';
            default: return status;
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600 dark:text-green-400';
        if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {ideas.map(idea => (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                    <h3 className="text-lg sm:text-xl font-semibold break-words">{idea.title}</h3>
                                    {idea.isFavorite && (
                                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    )}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                                        {getStatusLabel(idea.status)}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Créé le {formatDate(idea.createdAt)}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => onSelectIdea(idea)}
                                className="w-full sm:w-auto sm:ml-4"
                            >
                                Voir détails
                            </Button>
                        </div>

                        {/* Résumé */}
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Résumé</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {idea.analysis?.summary || idea.brainDump}
                            </p>
                        </div>

                        {/* Scores et métriques */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                            {idea.opportunityScore !== undefined && (
                                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                                    <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                                        {idea.opportunityScore.toFixed(1)}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">Opportunité</div>
                                </div>
                            )}
                            {idea.feasibilityScore !== undefined && (
                                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                                    <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {idea.feasibilityScore.toFixed(1)}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">Faisabilité</div>
                                </div>
                            )}
                            {idea.roadmapSteps && (
                                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                                    <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {idea.roadmapSteps.length}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">Étapes</div>
                                </div>
                            )}
                        </div>

                        {/* Technologies recommandées */}
                        {idea.evaluation?.recommendedTechnologies && idea.evaluation.recommendedTechnologies.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium mb-2">Technologies recommandées</h4>
                                <div className="flex flex-wrap gap-2">
                                    {idea.evaluation.recommendedTechnologies.slice(0, 5).map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-brand/10 text-brand text-xs rounded-md"
                                        >
                                            {tech.name}
                                        </span>
                                    ))}
                                    {idea.evaluation.recommendedTechnologies.length > 5 && (
                                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                                            +{idea.evaluation.recommendedTechnologies.length - 5} autres
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {idea.tags && idea.tags.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {idea.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Progression */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                                {idea.analysis && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Analysé
                                    </span>
                                )}
                                {idea.evaluation && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Évalué
                                    </span>
                                )}
                                {idea.roadmapSteps && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Roadmap
                                    </span>
                                )}
                            </div>
                            <div>
                                Mis à jour le {formatDate(idea.updatedAt || idea.createdAt)}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DetailView;
