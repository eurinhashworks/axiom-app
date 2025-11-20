import React, { useState } from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/apiClient';
import { advancedScoringService } from '../../services/scoringService';
import { useAuth } from '../../contexts/AuthContext';
import { firebaseService } from '../../services/firebaseService';
import ClarifyingQuestionsQuiz from './ClarifyingQuestionsQuiz';

interface AnalysisViewProps {
    idea: Idea;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ idea }) => {
    const { updateIdea } = useIdeas();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuiz, setShowQuiz] = useState(!idea.clarifyingAnswers || idea.clarifyingAnswers.length === 0);

    const evaluateCurrentIdea = async () => {
        if (idea.status !== 'ANALYZED') return;
        if (!user) {
            showToast('Vous devez être connecté pour évaluer une idée', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await apiClient.evaluateIdea(idea, idea.id, token);
            const evaluation = response.evaluation;
            
            // Charger le profil utilisateur pour le scoring adaptatif
            let userProfile = null;
            if (user) {
                try {
                    userProfile = await firebaseService.getUserProfile(user.uid);
                } catch (error) {
                    console.warn('Could not load user profile for adaptive scoring:', error);
                }
            }

            // Utiliser le scoring avancé au lieu du calcul simple
            const scoringResult = advancedScoringService.calculateAdaptiveScores(
                evaluation,
                userProfile || undefined
            );

            // Valider l'évaluation
            const validation = advancedScoringService.validateEvaluation(evaluation);
            if (!validation.isValid) {
                console.warn('Évaluation avec incohérences détectées:', validation.inconsistencies);
            }

            await updateIdea(idea.id, {
                evaluation,
                opportunityScore: scoringResult.opportunityScore,
                feasibilityScore: scoringResult.feasibilityScore,
                status: 'EVALUATED',
            });
            
            showToast('Évaluation terminée avec succès !', 'success');
            
            // Afficher les recommandations si disponibles
            if (scoringResult.breakdown.recommendations.length > 0) {
                const firstRecommendation = scoringResult.breakdown.recommendations[0];
                showToast(firstRecommendation, 'info');
            }
        } catch (e: any) {
            console.error("Error during evaluation:", e.message);
            showToast('Une erreur est survenue lors de l\'évaluation.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!idea.analysis) return null;

    const { summary, clarifyingQuestions, potentialRisks } = idea.analysis;

    // Si le quiz n'a pas été complété, afficher le quiz
    if (showQuiz && idea.status === 'ANALYZED') {
        return (
            <div className="space-y-8 animate-fade-in">
                <Card className="hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">Résumé de l'Idée</h3>
                    <p className="text-muted-foreground leading-relaxed">{summary}</p>
                </Card>
                
                <ClarifyingQuestionsQuiz
                    idea={idea}
                    onComplete={() => {
                        setShowQuiz(false);
                        showToast('Quiz terminé ! Vous pouvez maintenant passer à l\'évaluation.', 'success');
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <Card className="hover:shadow-lg transition-shadow">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Résumé de l'Idée</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{summary}</p>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Questions de Clarification</h3>
                    {idea.clarifyingAnswers && idea.clarifyingAnswers.length > 0 ? (
                        <div className="space-y-4">
                            {idea.clarifyingAnswers.map((answer, i) => (
                                <div key={i} className="p-3 bg-muted/50 rounded-lg">
                                    <p className="font-medium mb-2">{answer.question}</p>
                                    <p className="text-sm text-muted-foreground">
                                        ✓ Réponse : <span className="text-brand">{answer.selectedOption}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            {clarifyingQuestions.map((q, i) => {
                                const questionText = typeof q === 'string' ? q : q.question;
                                return (
                                    <li key={i} className="leading-relaxed">{questionText}</li>
                                );
                            })}
                        </ul>
                    )}
                    {idea.status === 'ANALYZED' && (!idea.clarifyingAnswers || idea.clarifyingAnswers.length === 0) && (
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowQuiz(true)}
                            className="mt-4"
                        >
                            Répondre aux questions
                        </Button>
                    )}
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Risques Potentiels</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {potentialRisks.map((r, i) => (
                            <li key={i} className="leading-relaxed">{r}</li>
                        ))}
                    </ul>
                </Card>
            </div>
            {idea.status === 'ANALYZED' && (
                <div className="text-center" data-section="analysis">
                    <Button onClick={evaluateCurrentIdea} isLoading={isLoading}>
                        Évaluer l'idée
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AnalysisView;
