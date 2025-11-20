import React from 'react';
import { Idea } from '../../types';
import {
    ChevronRightIcon,
    CalendarIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface TableViewProps {
    ideas: Idea[];
    onSelectIdea: (idea: Idea) => void;
}

const STATUS_STYLES: Record<string, string> = {
    'DRAFT': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'ANALYZING': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'ANALYZED': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'EVALUATED': 'bg-green-500/10 text-green-400 border-green-500/20',
    'ROADMAP_GENERATED': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const STATUS_LABELS: Record<string, string> = {
    'DRAFT': 'Brouillon',
    'ANALYZING': 'En Analyse',
    'ANALYZED': 'Analysé',
    'EVALUATED': 'Évalué',
    'ROADMAP_GENERATED': 'Roadmap',
};

const TableView: React.FC<TableViewProps> = ({ ideas, onSelectIdea }) => {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#1a1d24]/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 bg-[#1a1d24]">
                        <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider w-1/3">Idée</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Potentiel</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Création</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {ideas.map((idea) => (
                        <tr
                            key={idea.id}
                            onClick={() => onSelectIdea(idea)}
                            className="group hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <td className="py-4 px-6">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
                                        {idea.title}
                                    </span>
                                    <span className="text-xs text-gray-500 line-clamp-1 mt-1">
                                        {idea.brainDump}
                                    </span>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[idea.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                    {STATUS_LABELS[idea.status] || idea.status}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                {idea.opportunityScore ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${idea.opportunityScore > 70 ? 'bg-green-500' :
                                                        idea.opportunityScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${idea.opportunityScore}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-gray-400">{idea.opportunityScore}%</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-600">-</span>
                                )}
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center text-gray-500 text-sm">
                                    <CalendarIcon className="w-4 h-4 mr-2 opacity-50" />
                                    {new Date(idea.createdAt).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {ideas.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-500 italic">
                                Aucune idée trouvée
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableView;
