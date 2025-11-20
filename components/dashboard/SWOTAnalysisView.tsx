import React from 'react';
import Card from '../ui/Card';
import { SWOTAnalysis } from '../../types';

interface SWOTAnalysisViewProps {
    swotAnalysis: SWOTAnalysis;
}

const SWOTAnalysisView: React.FC<SWOTAnalysisViewProps> = ({ swotAnalysis }) => {
    const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
        switch (impact) {
            case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
            case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
        }
    };

    const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
        switch (severity) {
            case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
            case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
        }
    };

    const getPotentialColor = (potential: 'high' | 'medium' | 'low') => {
        switch (potential) {
            case 'high': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
            case 'low': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
        }
    };

    const getThreatColor = (likelihood: 'high' | 'medium' | 'low', impact: 'high' | 'medium' | 'low') => {
        if (likelihood === 'high' && impact === 'high') {
            return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
        }
        if (likelihood === 'medium' || impact === 'medium') {
            return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
        }
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4">Analyse SWOT</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Forces */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h4 className="font-semibold text-lg">Forces</h4>
                    </div>
                    <ul className="space-y-2">
                        {swotAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <div className="flex-1">
                                    <p className="text-sm">{strength.description}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getImpactColor(strength.impact)}`}>
                                        Impact: {strength.impact}
                                    </span>
                                    {strength.evidence && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">{strength.evidence}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Faiblesses */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <h4 className="font-semibold text-lg">Faiblesses</h4>
                    </div>
                    <ul className="space-y-2">
                        {swotAnalysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-yellow-500 mt-1">⚠</span>
                                <div className="flex-1">
                                    <p className="text-sm">{weakness.description}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getSeverityColor(weakness.severity)}`}>
                                        Sévérité: {weakness.severity}
                                    </span>
                                    {weakness.mitigation && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <strong>Mitigation:</strong> {weakness.mitigation}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Opportunités */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h4 className="font-semibold text-lg">Opportunités</h4>
                    </div>
                    <ul className="space-y-2">
                        {swotAnalysis.opportunities.map((opportunity, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">🚀</span>
                                <div className="flex-1">
                                    <p className="text-sm">{opportunity.description}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getPotentialColor(opportunity.potential)}`}>
                                        Potentiel: {opportunity.potential}
                                    </span>
                                    {opportunity.timeframe && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <strong>Délai:</strong> {opportunity.timeframe}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Menaces */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <h4 className="font-semibold text-lg">Menaces</h4>
                    </div>
                    <ul className="space-y-2">
                        {swotAnalysis.threats.map((threat, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">⚠</span>
                                <div className="flex-1">
                                    <p className="text-sm">{threat.description}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-2 py-0.5 text-xs rounded border ${getThreatColor(threat.likelihood, threat.impact)}`}>
                                            Probabilité: {threat.likelihood}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs rounded border ${getThreatColor(threat.likelihood, threat.impact)}`}>
                                            Impact: {threat.impact}
                                        </span>
                                    </div>
                                    {threat.mitigation && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <strong>Mitigation:</strong> {threat.mitigation}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* Implications Stratégiques */}
            {swotAnalysis.strategicImplications && swotAnalysis.strategicImplications.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg mb-3">Implications Stratégiques</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        {swotAnalysis.strategicImplications.map((implication, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{implication}</li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};

export default SWOTAnalysisView;

