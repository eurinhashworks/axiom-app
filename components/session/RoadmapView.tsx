// Fix: Implement RoadmapView component to resolve module not found and related errors.
import React from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import { useIdeas } from '../../contexts/IdeasContext';

interface RoadmapViewProps {
    idea: Idea;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ idea }) => {
    const { updateIdea } = useIdeas();

    if (!idea.roadmapSteps || idea.roadmapSteps.length === 0) {
        return null;
    }

    const handleToggleStep = (indexToToggle: number) => {
        const newRoadmapSteps = idea.roadmapSteps!.map((step, index) => {
            if (index === indexToToggle) {
                return { ...step, completed: !step.completed };
            }
            return step;
        });
        updateIdea(idea.id, { roadmapSteps: newRoadmapSteps });
    };

    return (
        <Card className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-4">Feuille de Route Interactive</h3>
            <div className="space-y-4">
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
                            className={`ml-3 text-base cursor-pointer transition-colors ${
                                step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                            }`}
                        >
                            {step.text}
                        </label>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RoadmapView;