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
        <Card className="overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 px-2 sm:px-0">Matrice Opportunité vs. Faisabilité</h3>
            <div className="relative w-full h-64 sm:h-80 bg-muted rounded-lg p-3 sm:p-4 overflow-hidden">
                {/* Axes */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2"></div>
                <div className="absolute left-1/2 top-0 w-px h-full bg-border -translate-x-1/2"></div>

                {/* Labels */}
                <span className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-muted-foreground font-bold">Haute Opportunité</span>
                <span className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-muted-foreground">Basse Opportunité</span>
                <span className="absolute top-1/2 right-1 sm:right-2 text-[10px] sm:text-xs -rotate-90 -translate-y-1/2 text-muted-foreground origin-bottom-right">Haute Faisabilité</span>
                <span className="absolute top-1/2 left-1 sm:left-2 text-[10px] sm:text-xs -rotate-90 translate-y-1/2 text-muted-foreground origin-top-left">Basse Faisabilité</span>

                {/* Quadrant Labels */}
                <span className="absolute top-2 sm:top-4 right-2 sm:right-4 text-xs sm:text-sm font-bold text-green-600">Pépites</span>
                <span className="absolute top-2 sm:top-4 left-2 sm:left-4 text-xs sm:text-sm font-bold text-blue-600">Grands Projets</span>
                <span className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-xs sm:text-sm font-bold text-red-600">Gouffres</span>
                <span className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-xs sm:text-sm font-bold text-yellow-600">Petits Gains</span>

                {/* Points */}
                {ideas.map(idea => (
                    <div
                        key={idea.id}
                        className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full cursor-pointer group transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150"
                        style={{
                            bottom: `${((idea.opportunityScore || 0) / 10) * 100}%`,
                            left: `${((idea.feasibilityScore || 0) / 10) * 100}%`,
                        }}
                        onClick={() => onSelectIdea(idea)}
                    >
                        <div className={`w-full h-full rounded-full ${getColor(idea.opportunityScore)} opacity-75`}></div>
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] sm:max-w-xs p-2 text-[10px] sm:text-xs text-background bg-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <p className="font-bold truncate">{idea.title}</p>
                            <p>Opp: {idea.opportunityScore?.toFixed(1)} | Feas: {idea.feasibilityScore?.toFixed(1)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default GraphView;
