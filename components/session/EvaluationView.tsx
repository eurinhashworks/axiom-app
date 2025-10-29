// Fix: Implement EvaluationView component to resolve module not found and related errors.
import React, { useState } from 'react';
import { Idea, RoadmapStep } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import * as geminiService from '../../services/geminiService';
import Spinner from '../ui/Spinner';

interface EvaluationViewProps {
    idea: Idea;
}

const EvaluationView: React.FC<EvaluationViewProps> = ({ idea }) => {
    const { updateIdea } = useIdeas();
    const [isLoading, setIsLoading] = useState(false);

    if (!idea.evaluation || !idea.opportunityScore || !idea.feasibilityScore) return null;

    const generateRoadmap = async () => {
        if (idea.status !== 'EVALUATED') return;
        setIsLoading(true);
        try {
            const roadmapStrings = await geminiService.generateRoadmap(idea);
            const roadmapSteps: RoadmapStep[] = roadmapStrings.map(step => ({ text: step, completed: false }));
            updateIdea(idea.id, { roadmapSteps, status: 'ROADMAP_GENERATED' });
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

    return (
        <div className="space-y-8 animate-fade-in">
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
            {idea.status === 'EVALUATED' && (
                <div className="text-center">
                    <Button onClick={generateRoadmap} disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Générer la Feuille de Route'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EvaluationView;