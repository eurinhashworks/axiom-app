import React, { useState } from 'react';
import { Idea, ClarifyingQuestion, ClarifyingQuestionAnswer } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';

interface ClarifyingQuestionsQuizProps {
    idea: Idea;
    onComplete: () => void;
}

const ClarifyingQuestionsQuiz: React.FC<ClarifyingQuestionsQuizProps> = ({ idea, onComplete }) => {
    const { updateIdea } = useIdeas();
    const { showToast } = useToast();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    
    if (!idea.analysis?.clarifyingQuestions) return null;

    // Convertir les questions au nouveau format si nécessaire
    const questions: ClarifyingQuestion[] = idea.analysis.clarifyingQuestions.map((q, index) => {
        if (typeof q === 'string') {
            // Ancien format : convertir en question à choix multiples basique
            return {
                question: q,
                options: [
                    'Oui, cette question a été considérée',
                    'Partiellement, certaines parties ont été réfléchies',
                    'Non, cette question n\'a pas encore été adressée',
                    'Je ne suis pas sûr'
                ],
                explanation: 'Cette question est importante pour affiner votre idée.'
            };
        }
        return q;
    });

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const allQuestionsAnswered = questions.every((_, index) => answers[index] !== undefined);

    const handleSelectOption = (option: string) => {
        setAnswers(prev => {
            const newAnswers = { ...prev, [currentQuestionIndex]: option };
            // Auto-avancer après sélection (optionnel, peut être désactivé)
            // setTimeout(() => {
            //     if (!isLastQuestion) {
            //         handleNext();
            //     }
            // }, 300);
            return newAnswers;
        });
    };

    const handleNext = () => {
        if (!answers[currentQuestionIndex]) {
            showToast('Veuillez sélectionner une réponse avant de continuer', 'warning');
            return;
        }

        if (isLastQuestion) {
            handleComplete();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        const clarifyingAnswers: ClarifyingQuestionAnswer[] = questions.map((q, index) => ({
            questionIndex: index,
            question: q.question,
            selectedOption: answers[index] || 'Non répondue',
            timestamp: Date.now()
        }));

        try {
            await updateIdea(idea.id, { clarifyingAnswers });
            showToast('Réponses enregistrées avec succès !', 'success');
            onComplete();
        } catch (error) {
            console.error('Error saving answers:', error);
            showToast('Erreur lors de l\'enregistrement des réponses', 'error');
        }
    };

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <Card className="max-w-3xl mx-auto animate-fade-in">
            <div className="space-y-6">
                {/* Header avec progression */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">Questions de Clarification</h3>
                        <span className="text-sm text-muted-foreground">
                            Question {currentQuestionIndex + 1} sur {questions.length}
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div 
                            className="bg-brand h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question actuelle */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-lg font-medium mb-2">{currentQuestion.question}</h4>
                        {currentQuestion.explanation && (
                            <p className="text-sm text-muted-foreground mb-4">
                                💡 {currentQuestion.explanation}
                            </p>
                        )}
                    </div>

                    {/* Options de réponse */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, optionIndex) => {
                            const isSelected = answers[currentQuestionIndex] === option;
                            return (
                                <button
                                    key={optionIndex}
                                    onClick={() => handleSelectOption(option)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                                        isSelected
                                            ? 'border-brand bg-brand/10 shadow-md'
                                            : 'border-border bg-background hover:border-brand/50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                            isSelected
                                                ? 'border-brand bg-brand text-white'
                                                : 'border-border'
                                        }`}>
                                            {isSelected && (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            {!isSelected && (
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {String.fromCharCode(65 + optionIndex)}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`flex-1 ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                            {option}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                    <Button
                        variant="secondary"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        ← Précédent
                    </Button>
                    
                    <div className="flex gap-2">
                        {questions.map((_, index) => {
                            const isAnswered = answers[index] !== undefined;
                            const isCurrent = index === currentQuestionIndex;
                            return (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        isCurrent
                                            ? 'bg-brand scale-125'
                                            : isAnswered
                                            ? 'bg-brand/50'
                                            : 'bg-border'
                                    }`}
                                    title={`Question ${index + 1}`}
                                />
                            );
                        })}
                    </div>

                    <Button
                        onClick={handleNext}
                        disabled={!answers[currentQuestionIndex]}
                    >
                        {isLastQuestion ? 'Terminer' : 'Suivant →'}
                    </Button>
                </div>

                {/* Info et conseils contextuels */}
                <div className="space-y-2">
                    <div className="text-center text-sm text-muted-foreground">
                        {allQuestionsAnswered ? (
                            <span className="text-green-600 dark:text-green-400">
                                ✓ Toutes les questions ont été répondues
                            </span>
                        ) : (
                            <span>Répondez à toutes les questions pour affiner votre évaluation</span>
                        )}
                    </div>
                    
                    {/* Feedback contextuel basé sur la réponse */}
                    {answers[currentQuestionIndex] && (
                        <div className="p-3 bg-brand/10 border border-brand/20 rounded-lg mt-2">
                            <p className="text-sm text-brand font-medium">
                                💡 Votre réponse sera utilisée pour adapter les recommandations d'évaluation et de technologies.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ClarifyingQuestionsQuiz;

