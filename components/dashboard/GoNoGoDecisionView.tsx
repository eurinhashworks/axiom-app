import React from 'react';
import Card from '../ui/Card';
import { GoNoGoRecommendation } from '../../types';

interface GoNoGoDecisionViewProps {
    goNoGo: GoNoGoRecommendation;
}

const GoNoGoDecisionView: React.FC<GoNoGoDecisionViewProps> = ({ goNoGo }) => {
    const getDecisionColor = (decision: string) => {
        switch (decision) {
            case 'go':
                return 'bg-green-500 text-white border-green-600';
            case 'no-go':
                return 'bg-red-500 text-white border-red-600';
            case 'pivot':
                return 'bg-orange-500 text-white border-orange-600';
            case 'wait':
                return 'bg-yellow-500 text-white border-yellow-600';
            default:
                return 'bg-gray-500 text-white border-gray-600';
        }
    };

    const getDecisionIcon = (decision: string) => {
        switch (decision) {
            case 'go':
                return '✓';
            case 'no-go':
                return '✗';
            case 'pivot':
                return '↻';
            case 'wait':
                return '⏸';
            default:
                return '?';
        }
    };

    const getDecisionLabel = (decision: string) => {
        switch (decision) {
            case 'go':
                return 'GO - Poursuivre';
            case 'no-go':
                return 'NO-GO - Abandonner';
            case 'pivot':
                return 'PIVOT - Changer de direction';
            case 'wait':
                return 'WAIT - Mettre en attente';
            default:
                return decision;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 75) return 'bg-green-500';
        if (confidence >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card className="hover:shadow-lg transition-shadow animate-fade-in">
            <div className="space-y-6">
                {/* Badge de Décision Principal */}
                <div className={`${getDecisionColor(goNoGo.decision)} p-6 rounded-lg text-center shadow-lg`}>
                    <div className="text-6xl mb-2">{getDecisionIcon(goNoGo.decision)}</div>
                    <h3 className="text-2xl font-bold mb-2">{getDecisionLabel(goNoGo.decision)}</h3>
                    <p className="text-sm opacity-90">Confiance: {goNoGo.confidence}%</p>
                </div>

                {/* Barre de Confiance */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Niveau de Confiance</span>
                        <span className="text-sm font-bold">{goNoGo.confidence}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getConfidenceColor(goNoGo.confidence)} transition-all duration-500`}
                            style={{ width: `${goNoGo.confidence}%` }}
                        ></div>
                    </div>
                </div>

                {/* Rationale */}
                <div>
                    <h4 className="font-semibold mb-2">Explication</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{goNoGo.rationale}</p>
                </div>

                {/* Facteurs Clés */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Facteurs Positifs */}
                    {goNoGo.keyFactors.positive.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                                ✓ Facteurs Positifs
                            </h4>
                            <ul className="space-y-1">
                                {goNoGo.keyFactors.positive.map((factor, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <span className="text-green-500 mt-1">•</span>
                                        <span>{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Facteurs Négatifs */}
                    {goNoGo.keyFactors.negative.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">
                                ✗ Facteurs Négatifs
                            </h4>
                            <ul className="space-y-1">
                                {goNoGo.keyFactors.negative.map((factor, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Conditions */}
                {goNoGo.conditions && goNoGo.conditions.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">
                            {goNoGo.decision === 'wait' || goNoGo.decision === 'pivot'
                                ? 'Conditions à Remplir'
                                : 'Recommandations'}
                        </h4>
                        <ul className="space-y-1">
                            {goNoGo.conditions.map((condition, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                    <span className="text-blue-500 mt-1">→</span>
                                    <span>{condition}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default GoNoGoDecisionView;

