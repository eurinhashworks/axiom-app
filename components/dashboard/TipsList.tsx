import React from 'react';

interface TipsListProps {
    tips: string[];
    title?: string;
}

const TipsList: React.FC<TipsListProps> = ({ tips, title = "Conseils pour l'étape" }) => {
    if (!tips || tips.length === 0) return null;
    return (
        <div className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="text-sm text-muted-foreground mb-2">{title}</div>
            <ul className="list-disc pl-5 space-y-1">
                {tips.slice(0, 5).map((t, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{t}</li>
                ))}
            </ul>
        </div>
    );
};

export default TipsList;
