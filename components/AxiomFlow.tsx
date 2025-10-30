import React, { useState, useEffect } from 'react';
import { useIdeas } from '../contexts/IdeasContext';
import DashboardPage from '../pages/DashboardPage';
import SessionPage from '../pages/SessionPage';
import ProfilePage from '../pages/ProfilePage';

const AxiomFlow: React.FC = () => {
    const { activeIdea } = useIdeas();
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>(() => {
        // Déterminer la page initiale basée sur le hash
        const hash = window.location.hash;
        if (hash === '#profile') return 'profile';
        return 'dashboard';
    });

    // Écouter les changements de hash
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#profile') {
                setCurrentPage('profile');
            } else {
                setCurrentPage('dashboard');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Si une idée active est sélectionnée, aller en mode session
    if (activeIdea) {
        return <SessionPage />;
    }

    // Sinon, afficher la page appropriée
    if (currentPage === 'profile') {
        return <ProfilePage />;
    }

    return <DashboardPage />;
};

export default AxiomFlow;
