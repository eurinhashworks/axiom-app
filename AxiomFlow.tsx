import React from 'react';
import { useIdeas } from './contexts/IdeasContext';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';

const AxiomFlow: React.FC = () => {
    const { activeIdea } = useIdeas();

    return activeIdea ? <SessionPage /> : <DashboardPage />;
};

export default AxiomFlow;
