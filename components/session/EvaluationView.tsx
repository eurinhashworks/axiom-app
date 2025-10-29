// Fix: Implement EvaluationView component to resolve module not found and related errors.
import React, { useState } from 'react';
import { Idea, RoadmapStep } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import * as geminiService from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import TechComparisonModal from './TechComparisonModal';

interface EvaluationViewProps {
    idea: Idea;
}

const EvaluationView: React.FC<EvaluationViewProps> = ({ idea }) => {
    const { updateIdea } = useIdeas();
    const [isLoading, setIsLoading] = useState(false);
    const [showTechComparison, setShowTechComparison] = useState(false);

    if (!idea.evaluation || !idea.opportunityScore || !idea.feasibilityScore) return null;

    const generateRoadmap = async () => {
        if (idea.status !== 'EVALUATED') return;
        setIsLoading(true);
        try {
            const roadmapStrings = await geminiService.generateRoadmap(idea);
            const roadmapSteps: RoadmapStep[] = roadmapStrings.map(step => ({ text: step, completed: false }));
            await updateIdea(idea.id, { roadmapSteps, status: 'ROADMAP_GENERATED' });
        } catch (e: any) {
            console.error("Error generating roadmap:", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const scoreCategories = [
        { label: "Urgence du Problème", score: idea.evaluation.problemUrgency, group: 'Opportunité' },
        { label: "Taille du Marché Cible", score: idea.evaluation.targetMarketSize, group: 'Opportunité' },
        { label: "Avantage Concurrentiel", score: idea.evaluation.competitiveAdvantage, group: 'Opportunité' },
        { label: "Alignement Personnel", score: idea.evaluation.personalAlignment, group: 'Faisabilité' },
        { label: "Faisabilité Technique", score: idea.evaluation.technicalFeasibility, group: 'Faisabilité' },
    ];
    
    const getColor = (s: number) => {
        if (s > 7) return 'bg-green-500';
        if (s > 4) return 'bg-yellow-500';
        return 'bg-red-500';
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600 dark:text-green-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            case 'hard': return 'text-red-600 dark:text-red-400';
            default: return 'text-muted-foreground';
        }
    };

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Facile';
            case 'medium': return 'Moyen';
            case 'hard': return 'Difficile';
            default: return difficulty;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in" data-section="evaluation">
            <Card>
                <h3 className="text-xl font-semibold mb-4">Évaluation de l'Idée</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Score Overview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <span className="font-semibold text-lg">Score d'Opportunité</span>
                            <span className={`text-2xl font-bold px-3 py-1 rounded-md text-white ${getColor(idea.opportunityScore)}`}>
                                {idea.opportunityScore.toFixed(1)}
                            </span>
                        </div>
                         <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <span className="font-semibold text-lg">Score de Faisabilité</span>
                            <span className={`text-2xl font-bold px-3 py-1 rounded-md text-white ${getColor(idea.feasibilityScore)}`}>
                                {idea.feasibilityScore.toFixed(1)}
                            </span>
                        </div>
                    </div>
                    {/* Score Details */}
                    <div className="space-y-2">
                       {scoreCategories.map(({ label, score }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-muted-foreground">{label}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-border rounded-full">
                                        <div className={`h-2 rounded-full ${getColor(score)}`} style={{ width: `${score * 10}%` }}></div>
                                    </div>
                                    <span className="font-semibold w-8 text-right">{score}/10</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Technologies recommandées */}
            {(idea.evaluation?.recommendedTechnologies && idea.evaluation.recommendedTechnologies.length > 0) && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Technologies Recommandées</h3>
                        <Button
                            variant="secondary"
                            className="text-sm px-3 py-1"
                            onClick={() => setShowTechComparison(true)}
                        >
                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Comparer
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {idea.evaluation.recommendedTechnologies.map((tech, index) => (
                            <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border hover:border-brand transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-brand">{tech.name}</h4>
                                        <span className="text-xs text-muted-foreground">{tech.category}</span>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(tech.difficulty)} bg-muted`}>
                                        {getDifficultyBadge(tech.difficulty)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{tech.reason}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Bases de données recommandées */}
            {(idea.evaluation?.recommendedDatabases && idea.evaluation.recommendedDatabases.length > 0) && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Bases de Données Recommandées</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {idea.evaluation.recommendedDatabases.map((db, index) => (
                            <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-brand">{db.name}</h4>
                                        <span className="text-xs text-muted-foreground">{db.category}</span>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(db.difficulty)} bg-muted`}>
                                        {getDifficultyBadge(db.difficulty)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{db.reason}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {idea.status === 'EVALUATED' && (
                <div className="text-center">
                    <Button onClick={generateRoadmap} disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Générer la Feuille de Route'}
                    </Button>
                </div>
            )}

            {showTechComparison && (
                <TechComparisonModal
                    idea={idea}
                    isOpen={showTechComparison}
                    onClose={() => setShowTechComparison(false)}
                />
            )}
        </div>
    );
};

export default EvaluationView;