import React, { useState, useEffect } from 'react';
import { useIdeas } from '../../contexts/IdeasContext';
import UserMenu from '../auth/UserMenu';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

const SimpleHeader: React.FC = () => {
    const { activeIdea, setActiveIdea, syncing } = useIdeas();
    const [currentView, setCurrentView] = useState<'dashboard' | 'explore' | 'profile'>(() => {
        const hash = window.location.hash;
        if (hash === '#explore') return 'explore';
        if (hash === '#profile') return 'profile';
        return 'dashboard';
    });

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#explore') {
                setCurrentView('explore');
            } else if (hash === '#profile') {
                setCurrentView('profile');
            } else {
                setCurrentView('dashboard');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleLogoClick = () => {
        setActiveIdea(null);
        setCurrentView('dashboard');
        window.location.hash = '#dashboard';
    };

    const handleNavigateToExplore = () => {
        setActiveIdea(null);
        setCurrentView('explore');
        window.location.hash = '#explore';
    };

    const handleNavigateToDashboard = () => {
        setActiveIdea(null);
        setCurrentView('dashboard');
        window.location.hash = '#dashboard';
    };

    const handleNavigateToProfile = () => {
        setActiveIdea(null);
        setCurrentView('profile');
        window.location.hash = '#profile';
    };

    return (
        <header className="py-4 px-8 border-b border-border mb-8 flex-shrink-0 bg-card/50 backdrop-blur-sm sticky top-0 z-40 transition-all">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleLogoClick} 
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
                    {!activeIdea && (
                        <nav className="hidden md:flex items-center gap-2 ml-8">
                            <Button
                                variant={currentView === 'dashboard' ? 'primary' : 'secondary'}
                                onClick={handleNavigateToDashboard}
                                className="text-sm"
                            >
                                Mes Idées
                            </Button>
                            <Button
                                variant={currentView === 'explore' ? 'primary' : 'secondary'}
                                onClick={handleNavigateToExplore}
                                className="text-sm"
                            >
                                Explorer
                            </Button>
                            <Button
                                variant={currentView === 'profile' ? 'primary' : 'secondary'}
                                onClick={handleNavigateToProfile}
                                className="text-sm"
                            >
                                Profil
                            </Button>
                        </nav>
                    )}
                    {syncing && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Spinner />
                            <span className="hidden sm:inline">Synchronisation...</span>
                        </div>
                    )}
                </div>
                <UserMenu />
            </div>
        </header>
    );
};

export default SimpleHeader;
