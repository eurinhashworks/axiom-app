import React from 'react';
import Button from '../ui/Button';
import { Step } from '../../types';

interface RecommendationsProps {
    quick?: Step | null;
    impact?: Step | null;
    onSelect: (step: Step) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ quick, impact, onSelect }) => {
    if (!quick && !impact) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quick && (
                <div className="p-4 rounded-lg border border-border bg-background">
                    <div className="text-xs font-semibold text-green-600 mb-1">Quick win</div>
                    <div className="text-sm font-semibold truncate">{quick.title}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                        {quick.estimateMinutes ? `${quick.estimateMinutes} min` : 'Durée inconnue'}
                    </div>
                    <Button className="text-sm" onClick={() => onSelect(quick)}>Commencer</Button>
                </div>
            )}
            {impact && (
                <div className="p-4 rounded-lg border border-border bg-background">
                    <div className="text-xs font-semibold text-blue-600 mb-1">High impact</div>
                    <div className="text-sm font-semibold truncate">{impact.title}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                        {impact.difficulty ? `Difficulté: ${impact.difficulty}` : 'Difficulté inconnue'}
                    </div>
                    <Button className="text-sm" onClick={() => onSelect(impact)}>Commencer</Button>
                </div>
            )}
        </div>
    );
};

export default Recommendations;
