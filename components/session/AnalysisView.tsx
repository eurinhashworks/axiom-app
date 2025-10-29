import React from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';
import * as geminiService from '../../services/geminiService';

interface AnalysisViewProps {
    idea: Idea;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ idea }) => {
    const { updateIdea } = useIdeas();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const evaluateCurrentIdea = async () => {
        if (idea.status !== 'ANALYZED') return;
        setIsLoading(true);
        try {
            const evaluation = await geminiService.evaluateIdea(idea);
            const opportunityScore = (evaluation.problemUrgency + evaluation.targetMarketSize + evaluation.competitiveAdvantage) / 3;
            const feasibilityScore = (evaluation.personalAlignment + evaluation.technicalFeasibility) / 2;
            updateIdea(idea.id, { evaluation, opportunityScore, feasibilityScore, status: 'EVALUATED' });
            showToast('Évaluation terminée avec succès !', 'success');
        } catch (e: any) {
            console.error("Error during evaluation:", e.message);
            showToast('Une erreur est survenue lors de l\'évaluation.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!idea.analysis) return null;

    const { summary, clarifyingQuestions, potentialRisks } = idea.analysis;

    return (
        <div className="space-y-8 animate-fade-in">
            <Card className="hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">Résumé de l'Idée</h3>
                <p className="text-muted-foreground leading-relaxed">{summary}</p>
            </Card>
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-4">Questions de Clarification</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {clarifyingQuestions.map((q, i) => (
                            <li key={i} className="leading-relaxed">{q}</li>
                        ))}
                    </ul>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-4">Risques Potentiels</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {potentialRisks.map((r, i) => (
                            <li key={i} className="leading-relaxed">{r}</li>
                        ))}
                    </ul>
                </Card>
            </div>
            {idea.status === 'ANALYZED' && (
                <div className="text-center">
                    <Button onClick={evaluateCurrentIdea} isLoading={isLoading}>
                        Évaluer l'idée
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AnalysisView;