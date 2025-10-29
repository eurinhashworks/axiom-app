import React from 'react';
// Fix: Corrected import paths to reflect component's location in the directory structure.
import { useIdeas } from '../contexts/IdeasContext';
// Fix: Corrected import paths to reflect component's location in the directory structure.
import DashboardPage from '../pages/DashboardPage';
// Fix: Corrected import paths to reflect component's location in the directory structure.
import SessionPage from '../pages/SessionPage';

const AxiomFlow: React.FC = () => {
    const { activeIdea } = useIdeas();

    return activeIdea ? <SessionPage /> : <DashboardPage />;
};

export default AxiomFlow;