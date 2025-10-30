import React from 'react';
import Button from '../ui/Button';

interface ProgressAndNextProps {
    progressPercent: number | null;
    roadmapTitle?: string | null;
    nextStepTitle: string | null;
    onStartNext: () => void;
}

const ProgressAndNext: React.FC<ProgressAndNextProps> = ({ progressPercent, roadmapTitle, nextStepTitle, onStartNext }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Ma progression</div>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{progressPercent !== null ? `${progressPercent}%` : '--'}</div>
                    <div className="text-xs text-muted-foreground">
                        {roadmapTitle || 'Aucune roadmap'}
                    </div>
                </div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Prochaine étape</div>
                <div className="flex items-center justify-between gap-2">
                    <div className="text-base font-semibold truncate">{nextStepTitle || '—'}</div>
                    {nextStepTitle && (
                        <Button onClick={onStartNext} className="text-sm">Commencer</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressAndNext;
