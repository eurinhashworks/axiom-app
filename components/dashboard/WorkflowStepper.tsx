import React from 'react';
import { Idea, IdeaStatus } from '../../types';
import {
    LightBulbIcon,
    ChatBubbleBottomCenterTextIcon,
    GlobeAltIcon,
    ScaleIcon,
    MapIcon,
    CheckIcon
} from '@heroicons/react/24/solid';

interface WorkflowStepperProps {
    currentStatus: IdeaStatus;
    onStepClick: (stepStatus: IdeaStatus) => void;
}

const STEPS: { status: IdeaStatus; label: string; icon: any; description: string }[] = [
    {
        status: 'DRAFT',
        label: 'Capture',
        icon: LightBulbIcon,
        description: 'Idée brute'
    },
    {
        status: 'ANALYZING',
        label: 'Clarification',
        icon: ChatBubbleBottomCenterTextIcon,
        description: 'Quiz IA'
    },
    {
        status: 'ANALYZED',
        label: 'Investigation',
        icon: GlobeAltIcon,
        description: 'Recherche 360°'
    },
    {
        status: 'EVALUATED',
        label: 'Jugement',
        icon: ScaleIcon,
        description: 'Scoring'
    },
    {
        status: 'ROADMAP_GENERATED',
        label: 'Action',
        icon: MapIcon,
        description: 'Roadmap'
    }
];

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ currentStatus, onStepClick }) => {
    const getCurrentStepIndex = () => {
        return STEPS.findIndex(s => s.status === currentStatus);
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between w-full">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-white/5 rounded-full -z-10" />

                {/* Active Progress Bar */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full -z-10 transition-all duration-500 ease-out"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.status}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => onStepClick(step.status)}
                        >
                            <div
                                className={`
                                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                                    ${isCompleted
                                        ? 'bg-[#1a1d24] border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                        : 'bg-[#0f1115] border-white/10 text-gray-600 hover:border-white/30'
                                    }
                                    ${isCurrent ? 'scale-110 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-[#0f1115]' : ''}
                                `}
                            >
                                {index < currentStepIndex ? (
                                    <CheckIcon className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}

                                {/* Pulse effect for current step */}
                                {isCurrent && (
                                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
                                )}
                            </div>

                            <div className="mt-2 text-center">
                                <div className={`text-xs font-bold transition-colors ${isCompleted ? 'text-gray-200' : 'text-gray-600'}`}>
                                    {step.label}
                                </div>
                                <div className="text-[10px] text-gray-500 hidden sm:block">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkflowStepper;
