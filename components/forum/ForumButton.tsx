import React from 'react';
import Button from '../ui/Button';
import { Idea } from '../../types';

interface ForumButtonProps {
  idea?: Idea;
  className?: string;
}

const ForumButton: React.FC<ForumButtonProps> = ({ idea, className = "" }) => {
  const handleOpenForum = () => {
    // Ouvrir la page forum
    window.location.hash = '#forum';
    
    // Si une idée est fournie, on pourrait ajouter un paramètre pour la pré-sélectionner
    if (idea) {
      // Optionnel : ajouter un paramètre URL pour pré-sélectionner l'idée
      // window.location.hash = `#forum?idea=${idea.id}`;
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleOpenForum}
      className={className}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {idea ? 'Discuter de cette idée sur le forum' : 'Ouvrir le forum'}
    </Button>
  );
};

export default ForumButton;
