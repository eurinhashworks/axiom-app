import React from 'react';
import { Idea, IdeaStatus } from '../../types';
import {
    LightBulbIcon,
    BeakerIcon,
    CheckCircleIcon,
    MapIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

interface KanbanViewProps {
    ideas: Idea[];
    onSelectIdea: (idea: Idea) => void;
    onUpdateStatus: (ideaId: string, newStatus: IdeaStatus) => void;
}

const COLUMNS: { id: string; title: string; statuses: IdeaStatus[]; icon: any; color: string }[] = [
    {
        id: 'backlog',
        title: 'Idées Brutes',
        statuses: ['DRAFT'],
        icon: LightBulbIcon,
        color: 'text-yellow-400'
    },
    {
        id: 'analysis',
        title: 'En Analyse',
        statuses: ['ANALYZING'],
        icon: BeakerIcon,
        color: 'text-blue-400'
    },
    {
        id: 'validated',
        title: 'Validées',
        statuses: ['ANALYZED', 'EVALUATED'],
        icon: CheckCircleIcon,
        color: 'text-green-400'
    },
    {
        id: 'roadmap',
        title: 'Roadmap',
        statuses: ['ROADMAP_GENERATED'],
        icon: MapIcon,
        color: 'text-purple-400'
    }
];

const KanbanView: React.FC<KanbanViewProps> = ({ ideas, onSelectIdea, onUpdateStatus }) => {

    const getColumnIdeas = (statuses: IdeaStatus[]) => {
        return ideas.filter(idea => statuses.includes(idea.status));
    };

    const handleDragStart = (e: React.DragEvent, ideaId: string) => {
        e.dataTransfer.setData('ideaId', ideaId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetStatuses: IdeaStatus[]) => {
        e.preventDefault();
        const ideaId = e.dataTransfer.getData('ideaId');
        // Default to the first status in the target column (usually the main one)
        if (ideaId && targetStatuses.length > 0) {
            onUpdateStatus(ideaId, targetStatuses[0]);
        }
    };

    return (
        <div className="flex h-full space-x-6 overflow-x-auto pb-4">
            {COLUMNS.map(column => {
                const columnIdeas = getColumnIdeas(column.statuses);
                const Icon = column.icon;

                return (
                    <div
                        key={column.id}
                        className="flex-shrink-0 w-80 flex flex-col h-full"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.statuses)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-[#1a1d24]/80 backdrop-blur-sm rounded-xl border border-white/5 shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-white/5 ${column.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-gray-200">{column.title}</span>
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-400 font-mono">
                                    {columnIdeas.length}
                                </span>
                            </div>
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <EllipsisHorizontalIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Column Content */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {columnIdeas.map(idea => (
                                <div
                                    key={idea.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idea.id)}
                                    onClick={() => onSelectIdea(idea)}
                                    className="group relative p-4 bg-[#1a1d24] hover:bg-[#20242c] border border-white/5 hover:border-blue-500/30 rounded-xl shadow-sm hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                            {idea.title}
                                        </h4>
                                    </div>

                                    <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                                        {idea.brainDump}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                        <div className="flex items-center space-x-2">
                                            {idea.opportunityScore && (
                                                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${idea.opportunityScore > 80 ? 'bg-green-500/20 text-green-400' :
                                                        idea.opportunityScore > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {idea.opportunityScore}%
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(idea.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Drop Zone Indicator (Empty State) */}
                            {columnIdeas.length === 0 && (
                                <div className="h-32 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-600 text-sm italic">
                                    Glisser ici
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanView;
