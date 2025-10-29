import React, { useState, useEffect } from 'react';
import { useIdeas } from '../../contexts/IdeasContext';
import UserMenu from '../auth/UserMenu';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

const SimpleHeader: React.FC = () => {
    const { activeIdea, setActiveIdea, syncing } = useIdeas();
    const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'forum'>(() => {
        const hash = window.location.hash;
        if (hash === '#profile') return 'profile';
        if (hash === '#forum') return 'forum';
        return 'dashboard';
    });

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#profile') {
                setCurrentView('profile');
            } else if (hash === '#forum') {
                setCurrentView('forum');
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

    const handleNavigateToForum = () => {
        setActiveIdea(null);
        setCurrentView('forum');
        window.location.hash = '#forum';
    };

    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <header className="py-3 sm:py-4 px-4 sm:px-8 border-b border-border mb-4 sm:mb-8 flex-shrink-0 bg-card/50 backdrop-blur-sm sticky top-0 z-40 transition-all">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <button 
                        onClick={handleLogoClick} 
                        className="text-lg sm:text-xl font-bold text-foreground hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand rounded whitespace-nowrap"
                    >
                        AxiomFlow
                    </button>
                    {activeIdea && (
                         <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                             <span className="text-muted-foreground hidden sm:inline">/</span>
                             <span className="font-semibold truncate text-sm sm:text-base max-w-[150px] sm:max-w-md">{activeIdea.title}</span>
                         </div>
                    )}
                    {!activeIdea && (
                        <>
                            {/* Menu desktop */}
                            <nav className="hidden md:flex items-center gap-2 ml-4 lg:ml-8">
                                <Button
                                    variant={currentView === 'dashboard' ? 'primary' : 'secondary'}
                                    onClick={handleNavigateToDashboard}
                                    className="text-sm"
                                >
                                    Mes Idées
                                </Button>
                                <Button
                                    variant={currentView === 'forum' ? 'primary' : 'secondary'}
                                    onClick={handleNavigateToForum}
                                    className="text-sm"
                                >
                                    Forum
                                </Button>
                                <Button
                                    variant={currentView === 'profile' ? 'primary' : 'secondary'}
                                    onClick={handleNavigateToProfile}
                                    className="text-sm"
                                >
                                    Profil
                                </Button>
                            </nav>
                            {/* Menu mobile toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden ml-auto text-muted-foreground hover:text-foreground p-2"
                                aria-label="Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </>
                    )}
                    {syncing && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground ml-auto sm:ml-0">
                            <Spinner />
                            <span className="hidden sm:inline">Synchronisation...</span>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <UserMenu />
                </div>
            </div>
            
            {/* Menu mobile dropdown */}
            {!activeIdea && mobileMenuOpen && (
                <nav className="md:hidden mt-4 pt-4 border-t border-border space-y-2">
                    <Button
                        variant={currentView === 'dashboard' ? 'primary' : 'secondary'}
                        onClick={() => {
                            handleNavigateToDashboard();
                            setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-sm"
                    >
                        Mes Idées
                    </Button>
                    <Button
                        variant={currentView === 'forum' ? 'primary' : 'secondary'}
                        onClick={() => {
                            handleNavigateToForum();
                            setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-sm"
                    >
                        Forum
                    </Button>
                    <Button
                        variant={currentView === 'profile' ? 'primary' : 'secondary'}
                        onClick={() => {
                            handleNavigateToProfile();
                            setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-sm"
                    >
                        Profil
                    </Button>
                </nav>
            )}
        </header>
    );
};

export default SimpleHeader;
