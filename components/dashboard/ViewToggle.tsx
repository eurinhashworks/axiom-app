import React from 'react';
import Button from '../ui/Button';

export type ViewMode = 'grid' | 'kanban' | 'compact' | 'detail';

interface ViewToggleProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
    const views = [
        { id: 'grid' as ViewMode, label: 'Grille', icon: '⊞' },
        { id: 'kanban' as ViewMode, label: 'Kanban', icon: '▦' },
        { id: 'compact' as ViewMode, label: 'Compact', icon: '☰' },
        { id: 'detail' as ViewMode, label: 'Détail', icon: '☷' }
    ];

    return (
        <div className="flex bg-muted rounded-lg p-1">
            {views.map(view => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-initial ${
                        currentView === view.id
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                    title={view.label}
                >
                    <span className="sm:mr-2">{view.icon}</span>
                    <span className="hidden sm:inline">{view.label}</span>
                </button>
            ))}
        </div>
    );
};

export default ViewToggle;
