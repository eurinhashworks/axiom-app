import React from 'react';
import { useIdeas } from '../../contexts/IdeasContext';
import ThemeToggle from '../ui/ThemeToggle';

const SimpleHeader: React.FC = () => {
    const { activeIdea, setActiveIdea } = useIdeas();

    return (
        <header className="py-4 px-8 border-b border-border mb-8 flex-shrink-0 bg-card/50 backdrop-blur-sm sticky top-0 z-40 transition-all">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveIdea(null)} 
                        className="text-xl font-bold text-foreground hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand rounded"
                    >
                        AxiomFlow
                    </button>
                    {activeIdea && (
                         <div className="flex items-center gap-2">
                             <span className="text-muted-foreground">/</span>
                             <span className="font-semibold truncate max-w-md">{activeIdea.title}</span>
                         </div>
                    )}
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default SimpleHeader;
