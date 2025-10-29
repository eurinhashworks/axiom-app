import React, { useState, useEffect } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface LikeButtonProps {
  ideaId: string;
  initialLikeCount?: number;
  initialHasLiked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  ideaId,
  initialLikeCount = 0,
  initialHasLiked = false,
  size = 'md',
  showCount = true
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToLikes(
      ideaId,
      user?.uid || null,
      (count, liked) => {
        setLikeCount(count);
        setHasLiked(liked);
      }
    );

    return () => unsubscribe();
  }, [ideaId, user]);

  const handleToggleLike = async () => {
    if (!user) {
      showToast('Vous devez être connecté pour aimer une idée', 'warning');
      return;
    }

    setIsToggling(true);
    try {
      const result = await firebaseService.toggleLike(ideaId, user.uid);
      setHasLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast('Erreur lors de la mise à jour du like', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isToggling || !user}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all
        ${hasLiked
          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
      `}
      title={hasLiked ? 'Ne plus aimer' : 'Aimer cette idée'}
    >
      {isToggling ? (
        <svg className={`${sizeClasses[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg
          className={sizeClasses[size]}
          fill={hasLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      {showCount && likeCount > 0 && (
        <span className={`font-semibold ${textSizeClasses[size]}`}>
          {likeCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton;

