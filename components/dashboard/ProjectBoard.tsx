import React, { useState } from 'react';
import { Idea, IdeaStatus } from '../../types';
import KanbanView from '@/components/dashboard/KanbanView';
import TableView from '@/components/dashboard/TableView';
import {
    Squares2X2Icon,
    TableCellsIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

export type ViewMode = 'kanban' | 'table';

interface ProjectBoardProps {
    ideas: Idea[];
    onSelectIdea: (idea: Idea) => void;
    onNewIdea: () => void;
    onUpdateStatus: (ideaId: string, newStatus: IdeaStatus) => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({
    ideas,
    onSelectIdea,
    onNewIdea,
    onUpdateStatus
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'ALL'>('ALL');

    // Filter ideas
    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.brainDump.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || idea.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col h-full w-full bg-[#0f1115] text-white overflow-hidden rounded-xl shadow-2xl border border-white/5">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-white/5 bg-[#13161c]/50 backdrop-blur-md z-10">
                <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Workspace
                    </h2>
                    <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>

                    {/* View Toggles */}
                    <div className="flex bg-[#1a1d24] rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'kanban'
                                ? 'bg-blue-500/20 text-blue-400 shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            title="Vue Kanban"
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'table'
                                ? 'bg-blue-500/20 text-blue-400 shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            title="Vue Tableur"
                        >
                            <TableCellsIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Actions & Search */}
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-white/5 rounded-lg leading-5 bg-[#1a1d24] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#20242c] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 sm:text-sm transition-all duration-200"
                        />
                    </div>

                    <button
                        onClick={onNewIdea}
                        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/20 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nouvelle Idée
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[url('/grid-pattern.svg')] bg-repeat opacity-100">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1115] via-transparent to-[#0f1115]/80 pointer-events-none" />

                <div className="h-full overflow-auto p-6">
                    {viewMode === 'kanban' ? (
                        <KanbanView
                            ideas={filteredIdeas}
                            onSelectIdea={onSelectIdea}
                            onUpdateStatus={onUpdateStatus}
                        />
                    ) : (
                        <TableView
                            ideas={filteredIdeas}
                            onSelectIdea={onSelectIdea}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectBoard;
