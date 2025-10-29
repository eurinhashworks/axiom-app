// Fix: Implement RoadmapView component to resolve module not found and related errors.
import React, { useState } from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import ExportModal from './ExportModal';

interface RoadmapViewProps {
    idea: Idea;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ idea }) => {
    const { updateIdea, setActiveIdea } = useIdeas();
    const [isExportOpen, setIsExportOpen] = useState(false);

    if (!idea.roadmapSteps || idea.roadmapSteps.length === 0) {
        return null;
    }

    const completedSteps = idea.roadmapSteps.filter(step => step.completed).length;
    const totalSteps = idea.roadmapSteps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;

    const handleToggleStep = async (indexToToggle: number) => {
        const newRoadmapSteps = idea.roadmapSteps!.map((step, index) => {
            if (index === indexToToggle) {
                return { ...step, completed: !step.completed };
            }
            return step;
        });
        try {
            await updateIdea(idea.id, { roadmapSteps: newRoadmapSteps });
        } catch (error) {
            console.error('Error updating roadmap step:', error);
        }
    };

    const handleReturnToDashboard = () => {
        setActiveIdea(null);
    };

    return (
        <Card className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold">Feuille de Route Interactive</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                        {completedSteps} / {totalSteps} complétées
                    </span>
                    <div className="flex-1 sm:flex-initial w-full sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-brand transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {idea.roadmapSteps.map((step, index) => (
                    <div key={index} className="flex items-center p-2 rounded-md transition-colors hover:bg-muted">
                        <input
                            type="checkbox"
                            id={`step-${idea.id}-${index}`}
                            checked={step.completed}
                            onChange={() => handleToggleStep(index)}
                            className="h-5 w-5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                        />
                        <label
                            htmlFor={`step-${idea.id}-${index}`}
                            className={`ml-3 text-base cursor-pointer transition-colors flex-1 ${
                                step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                            }`}
                        >
                            {step.text}
                        </label>
                    </div>
                ))}
            </div>

            {/* Actions post-roadmap */}
            <div className="pt-4 sm:pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={handleReturnToDashboard}
                            className="text-sm w-full sm:w-auto"
                        >
                            Retour au Dashboard
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setActiveIdea(null);
                                // Scroller vers le haut pour voir le bouton "Nouvelle Idée"
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-sm w-full sm:w-auto"
                        >
                            Créer une Nouvelle Idée
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setIsExportOpen(true)}
                            className="text-sm w-full sm:w-auto"
                        >
                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exporter
                        </Button>
                    </div>
                    {progressPercentage === 100 && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mt-3 sm:mt-0 w-full sm:w-auto justify-center sm:justify-start">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-sm">Roadmap complétée !</span>
                        </div>
                    )}
                </div>
            </div>

            {isExportOpen && (
                <ExportModal
                    idea={idea}
                    onClose={() => setIsExportOpen(false)}
                />
            )}
        </Card>
    );
};

export default RoadmapView;