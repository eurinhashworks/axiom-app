import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface CommentsSectionProps {
  ideaId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ ideaId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseService.subscribeToComments(ideaId, (commentsList) => {
      setComments(commentsList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [ideaId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    if (newComment.trim().length < 3) {
      showToast('Le commentaire doit contenir au moins 3 caractères', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseService.addComment(
        ideaId,
        user.uid,
        user.displayName || 'Utilisateur anonyme',
        user.photoURL,
        newComment.trim()
      );
      setNewComment('');
      showToast('Commentaire ajouté', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Erreur lors de l\'ajout du commentaire', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, commentUserId: string) => {
    if (!user || user.uid !== commentUserId) {
      showToast('Vous ne pouvez supprimer que vos propres commentaires', 'error');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await firebaseService.deleteComment(commentId);
      showToast('Commentaire supprimé', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast('Erreur lors de la suppression du commentaire', 'error');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">Chargement des commentaires...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Commentaires ({comments.length})</h3>

      {/* Formulaire de commentaire */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Vous'}
                className="w-8 h-8 rounded-full border border-border flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajoutez un commentaire..."
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none min-h-[80px]"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/500 caractères
                </span>
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting || newComment.trim().length < 3}
                  isLoading={isSubmitting}
                  className="text-sm"
                >
                  Publier
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun commentaire pour le moment.</p>
            {user && <p className="text-sm mt-2">Soyez le premier à commenter !</p>}
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
              {comment.userPhotoURL && (
                <img
                  src={comment.userPhotoURL}
                  alt={comment.userName}
                  className="w-8 h-8 rounded-full border border-border flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {user && user.uid === comment.userId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id, comment.userId)}
                      className="text-xs text-destructive hover:text-destructive/80 ml-auto"
                      title="Supprimer"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default CommentsSection;

