import React from 'react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

interface DashboardHeaderActionsProps {
    isPrioritizing: boolean;
    canPrioritize: boolean;
    onPrioritize: () => void;
    onNewIdea: () => void;
}

const DashboardHeaderActions: React.FC<DashboardHeaderActionsProps> = ({ isPrioritizing, canPrioritize, onPrioritize, onNewIdea }) => {
    return (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
                onClick={onPrioritize}
                disabled={isPrioritizing || !canPrioritize}
                variant="secondary"
                className="transition-all hover:scale-105 active:scale-95"
            >
                {isPrioritizing ? <Spinner/> : "Prioriser les Idées"}
            </Button>
            <Button 
                onClick={onNewIdea}
                className="transition-all hover:scale-105 active:scale-95"
            >
                + Nouvelle Idée
            </Button>
        </div>
    );
};

export default DashboardHeaderActions;


