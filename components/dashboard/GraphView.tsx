import React from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';

interface GraphViewProps {
    ideas: Idea[];
    onSelectIdea: (idea: Idea) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ ideas, onSelectIdea }) => {
    const getColor = (score: number | undefined) => {
        if (!score) return 'bg-gray-400';
        if (score > 7) return 'bg-green-500';
        if (score > 4) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4">Matrice Opportunité vs. Faisabilité</h3>
            <div className="relative w-full h-80 bg-muted rounded-lg p-4">
                {/* Axes */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2"></div>
                <div className="absolute left-1/2 top-0 w-px h-full bg-border -translate-x-1/2"></div>

                {/* Labels */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-bold">Haute Opportunité</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Basse Opportunité</span>
                <span className="absolute top-1/2 right-2 text-xs -rotate-90 -translate-y-1/2 text-muted-foreground origin-bottom-right">Haute Faisabilité</span>
                <span className="absolute top-1/2 left-2 text-xs -rotate-90 translate-y-1/2 text-muted-foreground origin-top-left">Basse Faisabilité</span>

                {/* Quadrant Labels */}
                <span className="absolute top-4 right-4 text-sm font-bold text-green-600">Pépites</span>
                <span className="absolute top-4 left-4 text-sm font-bold text-blue-600">Grands Projets</span>
                <span className="absolute bottom-4 left-4 text-sm font-bold text-red-600">Gouffres à Temps</span>
                <span className="absolute bottom-4 right-4 text-sm font-bold text-yellow-600">Petits Gains</span>


                {/* Points */}
                {ideas.map(idea => (
                    <div
                        key={idea.id}
                        className="absolute w-4 h-4 rounded-full cursor-pointer group transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150"
                        style={{
                            bottom: `${((idea.opportunityScore || 0) / 10) * 100}%`,
                            left: `${((idea.feasibilityScore || 0) / 10) * 100}%`,
                        }}
                        onClick={() => onSelectIdea(idea)}
                    >
                        <div className={`w-full h-full rounded-full ${getColor(idea.opportunityScore)} opacity-75`}></div>
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-background bg-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <p className="font-bold">{idea.title}</p>
                            <p>Opp: {idea.opportunityScore?.toFixed(1)} | Feas: {idea.feasibilityScore?.toFixed(1)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default GraphView;
