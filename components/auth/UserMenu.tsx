import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      showToast('Déconnexion réussie', 'success');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Erreur lors de la déconnexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Utilisateur'}
            className="w-8 h-8 rounded-full border-2 border-border"
          />
        )}
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium">{user.displayName || 'Utilisateur'}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {user.email}
          </p>
        </div>
      </div>
      <ThemeToggle />
      <Button
        variant="secondary"
        onClick={handleLogout}
        disabled={isLoading}
        isLoading={isLoading}
        className="text-sm"
      >
        Déconnexion
      </Button>
    </div>
  );
};

export default UserMenu;

