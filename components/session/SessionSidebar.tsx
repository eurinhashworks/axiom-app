import React from 'react';
import { Idea, IdeaStatus } from '../../types';

interface SessionSidebarProps {
    idea: Idea;
}

const statusMap: { [key in IdeaStatus]: { label: string; step: number } } = {
    DRAFT: { label: 'Brain Dump', step: 1 },
    ANALYZING: { label: 'Analyse', step: 2 },
    ANALYZED: { label: 'Analyse', step: 2 },
    EVALUATED: { label: 'Évaluation', step: 3 },
    ROADMAP_GENERATED: { label: 'Feuille de Route', step: 4 },
};

const STEPS = [
    { label: 'Brain Dump', step: 1 },
    { label: 'Analyse', step: 2 },
    { label: 'Évaluation', step: 3 },
    { label: 'Feuille de Route', step: 4 }
];

const SessionSidebar: React.FC<SessionSidebarProps> = ({ idea }) => {
    const currentStep = statusMap[idea.status]?.step || 1;

    return (
        <aside className="w-64 p-6 bg-card border-r border-border h-full flex-shrink-0">
            <h2 className="text-lg font-bold mb-6 truncate" title={idea.title}>{idea.title}</h2>
            <nav>
                <ul className="space-y-4">
                    {STEPS.map(({ label, step }) => {
                        const isCompleted = step < currentStep;
                        const isActive = step === currentStep;

                        return (
                            <li key={step} className="flex items-start">
                                <div className="flex flex-col items-center mr-4">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                        isActive ? 'border-brand' : isCompleted ? 'border-green-500' : 'border-border'
                                    } ${isCompleted ? 'bg-green-500 text-white' : ''}`}>
                                        {isCompleted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                            <span className={`${isActive ? 'text-brand font-bold' : ''}`}>{step}</span>
                                        )}
                                    </div>
                                    {step < STEPS.length && <div className={`w-0.5 h-6 mt-1 ${isCompleted ? 'bg-green-500' : 'bg-border'}`}></div>}
                                </div>
                                <span className={`font-medium pt-0.5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default SessionSidebar;
