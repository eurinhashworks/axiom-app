import React from 'react';
import Card from '../ui/Card';
import { WebResearchResults } from '../../types';

interface WebResearchResultsViewProps {
    webResearch: WebResearchResults;
}

const WebResearchResultsView: React.FC<WebResearchResultsViewProps> = ({ webResearch }) => {
    const getRelevanceColor = (relevance: 'high' | 'medium' | 'low') => {
        switch (relevance) {
            case 'high':
                return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
            case 'medium':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
            case 'low':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4">Recherche Web</h3>

            {/* Concurrents */}
            {webResearch.competitors.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg mb-3">Concurrents Identifiés</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {webResearch.competitors.slice(0, 10).map((competitor, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-start justify-between mb-1">
                                    <h5 className="font-medium">{competitor.name}</h5>
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                        competitor.type === 'direct'
                                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                    }`}>
                                        {competitor.type === 'direct' ? 'Direct' : 'Indirect'}
                                    </span>
                                </div>
                                {competitor.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{competitor.description}</p>
                                )}
                                {competitor.url && (
                                    <a
                                        href={competitor.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-brand hover:underline mt-1 inline-block"
                                    >
                                        Visiter →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Tendances Marché */}
            {webResearch.marketTrends.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg mb-3">Tendances Marché</h4>
                    <div className="space-y-3">
                        {webResearch.marketTrends.map((trend, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-start justify-between mb-1">
                                    <h5 className="font-medium">{trend.trend}</h5>
                                    <span className={`px-2 py-0.5 text-xs rounded ${getRelevanceColor(trend.relevance)}`}>
                                        {trend.relevance}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{trend.description}</p>
                                {trend.source && (
                                    <a
                                        href={trend.source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-brand hover:underline mt-1 inline-block"
                                    >
                                        Source →
                                    </a>
                                )}
                                {trend.date && (
                                    <p className="text-xs text-muted-foreground mt-1">{trend.date}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Articles de Presse */}
            {webResearch.newsArticles.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg mb-3">Actualités Pertinentes</h4>
                    <div className="space-y-3">
                        {webResearch.newsArticles.map((article, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <h5 className="font-medium text-brand hover:underline mb-1">
                                        {article.title}
                                    </h5>
                                    <p className="text-sm text-muted-foreground mb-2">{article.snippet}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {article.source && <span>{article.source}</span>}
                                        {article.date && <span>• {article.date}</span>}
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Requêtes de Recherche */}
            {webResearch.searchQueries.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg mb-3">Requêtes de Recherche Utilisées</h4>
                    <div className="flex flex-wrap gap-2">
                        {webResearch.searchQueries.map((query, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                            >
                                "{query}"
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Message si aucune donnée */}
            {webResearch.competitors.length === 0 &&
                webResearch.marketTrends.length === 0 &&
                webResearch.newsArticles.length === 0 && (
                <Card>
                    <p className="text-center text-muted-foreground py-4">
                        Aucune recherche web disponible. Assurez-vous que SERPER_API_KEY est configurée dans le backend.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default WebResearchResultsView;

