import React, { useState } from 'react';
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
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const getColumnIdeas = (statuses: IdeaStatus[]) => {
        return ideas.filter(idea => statuses.includes(idea.status));
    };

    const handleDragStart = (e: React.DragEvent, ideaId: string) => {
        e.dataTransfer.setData('ideaId', ideaId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedId(ideaId);

        // Add a subtle opacity to the dragged element
        (e.target as HTMLElement).style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1';
        setDraggedId(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (columnId: string) => {
        setDragOverColumn(columnId);
    };

    const handleDragLeave = (e: React.DragEvent, columnId: string) => {
        // Only reset if we're leaving the column container
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        if (
            e.clientX < rect.left ||
            e.clientX >= rect.right ||
            e.clientY < rect.top ||
            e.clientY >= rect.bottom
        ) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = (e: React.DragEvent, targetStatuses: IdeaStatus[]) => {
        e.preventDefault();
        const ideaId = e.dataTransfer.getData('ideaId');

        if (ideaId && targetStatuses.length > 0) {
            onUpdateStatus(ideaId, targetStatuses[0]);
        }

        setDragOverColumn(null);
        setDraggedId(null);
    };

    return (
        <div className="flex h-full space-x-6 overflow-x-auto pb-4">
            {COLUMNS.map(column => {
                const columnIdeas = getColumnIdeas(column.statuses);
                const Icon = column.icon;
                const isDropTarget = dragOverColumn === column.id;
                const isDragging = draggedId !== null;

                return (
                    <div
                        key={column.id}
                        className={`
                            flex-shrink-0 w-80 flex flex-col h-full
                            transition-all duration-300
                            ${isDropTarget ? 'scale-[1.02]' : ''}
                        `}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(column.id)}
                        onDragLeave={(e) => handleDragLeave(e, column.id)}
                        onDrop={(e) => handleDrop(e, column.statuses)}
                    >
                        {/* Column Header */}
                        <div className={`
                            flex items-center justify-between mb-4 p-3 
                            bg-[#1a1d24]/80 backdrop-blur-sm rounded-xl 
                            border shadow-sm
                            transition-all duration-300
                            ${isDropTarget
                                ? 'border-brand shadow-glow-brand scale-[1.02]'
                                : 'border-white/5'
                            }
                        `}>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-white/5 ${column.color} transition-transform duration-300 ${isDropTarget ? 'scale-110' : ''}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-gray-200">{column.title}</span>
                                <span className={`
                                    px-2 py-0.5 rounded-full text-xs font-mono
                                    transition-all duration-300
                                    ${isDropTarget
                                        ? 'bg-brand/20 text-brand scale-110'
                                        : 'bg-white/10 text-gray-400'
                                    }
                                `}>
                                    {columnIdeas.length}
                                </span>
                            </div>
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <EllipsisHorizontalIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Column Content */}
                        <div className={`
                            flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar
                            rounded-xl p-2 -m-2
                            transition-all duration-300
                            ${isDropTarget
                                ? 'bg-brand/5 ring-2 ring-brand/30 ring-inset'
                                : ''
                            }
                        `}>
                            {columnIdeas.map(idea => (
                                <div
                                    key={idea.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idea.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onSelectIdea(idea)}
                                    className={`
                                        group relative p-4 
                                        bg-[#1a1d24] hover:bg-[#20242c] 
                                        border hover:border-blue-500/30 
                                        rounded-xl shadow-sm hover:shadow-lg hover:shadow-blue-900/10 
                                        transition-all duration-200 cursor-pointer 
                                        hover:-translate-y-0.5
                                        active:scale-[0.98]
                                        ${draggedId === idea.id
                                            ? 'border-brand opacity-50'
                                            : 'border-white/5'
                                        }
                                    `}
                                >
                                    {/* Drag Handle Indicator */}
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex flex-col space-y-0.5">
                                            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                        </div>
                                    </div>

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
                                                <span className={`text-xs font-mono px-1.5 py-0.5 rounded transition-transform group-hover:scale-105 ${idea.opportunityScore > 80 ? 'bg-green-500/20 text-green-400' :
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

                            {/* Drop Zone Indicator */}
                            {columnIdeas.length === 0 && (
                                <div className={`
                                    h-32 border-2 border-dashed rounded-xl 
                                    flex flex-col items-center justify-center 
                                    text-sm italic
                                    transition-all duration-300
                                    ${isDropTarget
                                        ? 'border-brand bg-brand/10 text-brand scale-105'
                                        : 'border-white/5 text-gray-600'
                                    }
                                    ${isDragging && !isDropTarget ? 'border-white/10' : ''}
                                `}>
                                    {isDropTarget ? (
                                        <>
                                            <div className="text-xl mb-2">⬇️</div>
                                            <span>Déposer ici</span>
                                        </>
                                    ) : (
                                        <span>Glisser ici</span>
                                    )}
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
