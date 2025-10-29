import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LikeButton from './LikeButton';

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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

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
    e.stopPropagation();
    
    if (!user || !newComment.trim()) {
      return;
    }

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
      showToast('Commentaire ajouté avec succès !', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Erreur lors de l\'ajout du commentaire', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editCommentText.trim() || editCommentText.trim().length < 3) {
      showToast('Le commentaire doit contenir au moins 3 caractères', 'error');
      return;
    }

    try {
      await firebaseService.updateComment(commentId, editCommentText.trim());
      setEditingCommentId(null);
      setEditCommentText('');
      showToast('Commentaire modifié', 'success');
    } catch (error) {
      console.error('Error updating comment:', error);
      showToast('Erreur lors de la modification du commentaire', 'error');
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
    <Card className="p-4 sm:p-6 border-2 border-brand/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent">
          💬 Forum de Discussion
        </h3>
        <div className="flex items-center gap-3">
          <LikeButton ideaId={ideaId} size="md" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {comments.length} {comments.length === 1 ? 'commentaire' : 'commentaires'}
          </span>
        </div>
      </div>

      {/* Formulaire de commentaire */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Vous'}
                className="w-10 h-10 rounded-full border-2 border-brand flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-sm font-semibold text-foreground">{user.displayName || 'Vous'}</span>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez vos pensées, suggestions ou questions..."
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none min-h-[100px] transition-all"
                rows={4}
                maxLength={1000}
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3">
                <div className="flex flex-col gap-1">
                  <span className={`text-xs ${newComment.length > 950 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {newComment.length}/1000 caractères
                  </span>
                  {newComment.trim().length > 0 && newComment.trim().length < 3 && (
                    <span className="text-xs text-destructive">
                      Minimum 3 caractères requis
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting || newComment.trim().length < 3}
                  isLoading={isSubmitting}
                  className="text-sm px-4 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Publier
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border text-center">
          <p className="text-sm text-muted-foreground">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connectez-vous pour participer à la discussion
          </p>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium">Aucun commentaire pour le moment</p>
            {user && <p className="text-sm mt-2">Soyez le premier à partager vos pensées !</p>}
          </div>
        ) : (
          comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border transition-all hover:border-brand/50 ${
                index % 2 === 0 ? 'bg-muted/20' : 'bg-background'
              } border-border`}
            >
              <div className="flex gap-3">
                {comment.userPhotoURL ? (
                  <img
                    src={comment.userPhotoURL}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full border-2 border-brand flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand font-bold text-sm">
                      {comment.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    {user && user.uid === comment.userId && (
                      <div className="flex gap-2 ml-2">
                        {editingCommentId === comment.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(comment.id)}
                              className="text-xs text-brand hover:text-brand/80 p-1 rounded transition-colors"
                              title="Enregistrer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-xs text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                              title="Annuler"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="text-xs text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                              title="Modifier"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id, comment.userId)}
                              className="text-xs text-destructive hover:text-destructive/80 p-1 rounded transition-colors"
                              title="Supprimer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none min-h-[80px]"
                        rows={3}
                        maxLength={1000}
                      />
                      <div className="text-xs text-muted-foreground">
                        {editCommentText.length}/1000 caractères
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-background/50 p-3 rounded border border-border/50">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default CommentsSection;

