import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useIdeas } from '../../contexts/IdeasContext';
import { Bars3Icon, MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import UserMenu from '../auth/UserMenu';
import Button from '../ui/Button';
import NewIdeaModal from '../dashboard/NewIdeaModal';

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * Header principal de l'application
 * Contient recherche, notifications, actions rapides
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { setActiveIdea } = useIdeas();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNewIdea = () => {
    setIsNewIdeaModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une idée, une analyse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
                         placeholder:text-muted-foreground text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions + User Menu */}
        <div className="flex items-center gap-3">
          {/* Quick Action: Nouvelle Idée */}
          <Button
            onClick={handleNewIdea}
            className="hidden sm:flex"
          >
            <span className="mr-2">+</span>
            Nouvelle Idée
          </Button>

          {/* Mobile: Nouvelle Idée Button */}
          <button
            onClick={handleNewIdea}
            className="sm:hidden p-2 rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors"
            aria-label="Nouvelle idée"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-muted transition-colors relative"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5 text-muted-foreground" />
              {/* Badge notification (exemple) */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            
            {/* Notifications Dropdown (à implémenter) */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4">
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user && <UserMenu />}
        </div>
      </div>

      {/* New Idea Modal */}
      {isNewIdeaModalOpen && (
        <NewIdeaModal
          onClose={() => setIsNewIdeaModalOpen(false)}
          onCreate={async (title: string) => {
            // La modal gère déjà la création, on ferme juste
            setIsNewIdeaModalOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;

