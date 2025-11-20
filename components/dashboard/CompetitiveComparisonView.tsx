import React, { useState } from 'react';
import Card from '../ui/Card';
import { CompetitiveAnalysis } from '../../types';

interface CompetitiveComparisonViewProps {
    competitiveAnalysis: CompetitiveAnalysis;
}

const CompetitiveComparisonView: React.FC<CompetitiveComparisonViewProps> = ({ competitiveAnalysis }) => {
    const [filter, setFilter] = useState<'all' | 'direct' | 'indirect'>('all');

    const getMarketPositionColor = (position: string) => {
        switch (position) {
            case 'leader':
                return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
            case 'challenger':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
            case 'follower':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
            case 'niche':
                return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
        }
    };

    const getPositionLabel = (position: string) => {
        switch (position) {
            case 'leader': return 'Leader';
            case 'challenger': return 'Challenger';
            case 'follower': return 'Suiveur';
            case 'niche': return 'Niche';
            default: return position;
        }
    };

    const filteredCompetitors = filter === 'all'
        ? [...competitiveAnalysis.directCompetitors, ...competitiveAnalysis.indirectCompetitors]
        : filter === 'direct'
        ? competitiveAnalysis.directCompetitors
        : competitiveAnalysis.indirectCompetitors;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-semibold">Analyse Concurrentielle</h3>
                
                {/* Position Marché */}
                <div className={`px-4 py-2 rounded-lg border font-semibold ${getMarketPositionColor(competitiveAnalysis.marketPosition)}`}>
                    Position: {getPositionLabel(competitiveAnalysis.marketPosition)}
                </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'all'
                            ? 'bg-brand text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    Tous ({competitiveAnalysis.directCompetitors.length + competitiveAnalysis.indirectCompetitors.length})
                </button>
                <button
                    onClick={() => setFilter('direct')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'direct'
                            ? 'bg-brand text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    Directs ({competitiveAnalysis.directCompetitors.length})
                </button>
                <button
                    onClick={() => setFilter('indirect')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'indirect'
                            ? 'bg-brand text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    Indirects ({competitiveAnalysis.indirectCompetitors.length})
                </button>
            </div>

            {/* Liste des Concurrents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCompetitors.length > 0 ? (
                    filteredCompetitors.map((competitor, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg">{competitor.name}</h4>
                                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded border ${
                                            competitor.type === 'direct'
                                                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
                                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                        }`}>
                                            {competitor.type === 'direct' ? 'Direct' : 'Indirect'}
                                        </span>
                                    </div>
                                </div>
                                
                                {competitor.description && (
                                    <p className="text-sm text-muted-foreground">{competitor.description}</p>
                                )}

                                {competitor.url && (
                                    <a
                                        href={competitor.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-brand hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Visiter le site
                                    </a>
                                )}

                                {competitor.strengths && competitor.strengths.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Forces:</p>
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            {competitor.strengths.map((strength, i) => (
                                                <li key={i} className="flex items-start gap-1">
                                                    <span className="text-green-500">•</span>
                                                    <span>{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Faiblesses:</p>
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            {competitor.weaknesses.map((weakness, i) => (
                                                <li key={i} className="flex items-start gap-1">
                                                    <span className="text-red-500">•</span>
                                                    <span>{weakness}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                        Aucun concurrent {filter === 'all' ? '' : filter === 'direct' ? 'direct' : 'indirect'} trouvé
                    </div>
                )}
            </div>

            {/* Avantages Concurrentiels */}
            {competitiveAnalysis.competitiveAdvantages.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg mb-3 text-green-600 dark:text-green-400">
                        ✓ Avantages Concurrentiels
                    </h4>
                    <ul className="space-y-2">
                        {competitiveAnalysis.competitiveAdvantages.map((advantage, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{advantage}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Failles Concurrentielles */}
            {competitiveAnalysis.competitiveGaps.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg mb-3 text-blue-600 dark:text-blue-400">
                        🎯 Opportunités (Failles Concurrentielles)
                    </h4>
                    <ul className="space-y-2">
                        {competitiveAnalysis.competitiveGaps.map((gap, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{gap}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};

export default CompetitiveComparisonView;

