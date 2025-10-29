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
        <aside className="hidden lg:flex w-64 p-4 lg:p-6 bg-card border-r border-border h-full flex-shrink-0 flex-col">
            <h2 className="text-base lg:text-lg font-bold mb-4 lg:mb-6 truncate" title={idea.title}>{idea.title}</h2>
            <nav className="flex-1">
                <ul className="space-y-3 lg:space-y-4">
                    {STEPS.map(({ label, step }) => {
                        const isCompleted = step < currentStep;
                        const isActive = step === currentStep;

                        return (
                            <li key={step} className="flex items-start">
                                <div className="flex flex-col items-center mr-3 lg:mr-4">
                                    <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                                        isActive ? 'border-brand' : isCompleted ? 'border-green-500' : 'border-border'
                                    } ${isCompleted ? 'bg-green-500 text-white' : ''}`}>
                                        {isCompleted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lg:w-4 lg:h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                            <span className={`text-xs lg:text-sm ${isActive ? 'text-brand font-bold' : ''}`}>{step}</span>
                                        )}
                                    </div>
                                    {step < STEPS.length && <div className={`w-0.5 h-5 lg:h-6 mt-1 ${isCompleted ? 'bg-green-500' : 'bg-border'}`}></div>}
                                </div>
                                <span className={`text-sm lg:text-base font-medium pt-0.5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default SessionSidebar;
