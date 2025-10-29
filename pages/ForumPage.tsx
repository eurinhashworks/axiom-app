import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Idea } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Breadcrumb from '../components/ui/Breadcrumb';
import ForumStats from '../components/forum/ForumStats';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  ideaId?: string;
  ideaTitle?: string;
  createdAt: number;
  updatedAt: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

const ForumPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState({ title: '', content: '' });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await firebaseService.getForumPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading forum posts:', error);
      showToast('Erreur lors du chargement du forum', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    setIsCreatingPost(true);
    try {
      const postData = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Utilisateur anonyme',
        authorPhotoURL: user.photoURL || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        likes: 0,
        comments: 0
      };

      await firebaseService.createForumPost(postData);
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
      showToast('Discussion créée avec succès !', 'success');
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Erreur lors de la création de la discussion', 'error');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      showToast('Vous devez être connecté pour aimer une discussion', 'info');
      return;
    }

    try {
      await firebaseService.toggleForumPostLike(postId, user.uid);
      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast('Erreur lors de l\'action J\'aime', 'error');
    }
  };

  const handleEditPost = (post: ForumPost) => {
    setEditingPostId(post.id);
    setEditPostData({ title: post.title, content: post.content });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditPostData({ title: '', content: '' });
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editPostData.title.trim() || !editPostData.content.trim()) {
      showToast('Le titre et le contenu sont requis', 'error');
      return;
    }

    try {
      await firebaseService.updateForumPost(postId, editPostData.title, editPostData.content);
      setEditingPostId(null);
      setEditPostData({ title: '', content: '' });
      showToast('Discussion modifiée avec succès', 'success');
      loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette discussion ?')) {
      return;
    }

    try {
      await firebaseService.deleteForumPost(postId);
      showToast('Discussion supprimée', 'success');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query)
      );
    }

    // Filtrage par onglet
    switch (activeTab) {
      case 'recent':
        filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => b.likes - a.likes);
        break;
      default:
        filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '#dashboard' },
              { label: 'Forum', current: true }
            ]} 
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Forum de Discussion</h1>
              <p className="text-muted-foreground mt-2">
                Échangez avec la communauté sur vos idées et projets
              </p>
            </div>
            {user && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle Discussion
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Recherche */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Rechercher</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher dans les discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-border rounded-md bg-background text-foreground text-sm"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </Card>

              {/* Filtres */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Filtrer par</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'all'
                        ? 'bg-brand text-brand-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    Toutes les discussions
                  </button>
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'recent'
                        ? 'bg-brand text-brand-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    Plus récentes
                  </button>
                  <button
                    onClick={() => setActiveTab('popular')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'popular'
                        ? 'bg-brand text-brand-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    Plus populaires
                  </button>
                </div>
              </Card>

              {/* Statistiques */}
              <ForumStats
                totalPosts={posts.length}
                postsWithIdeas={posts.filter(p => p.ideaId).length}
                totalLikes={posts.reduce((sum, p) => sum + p.likes, 0)}
                recentPosts={posts.filter(p => {
                  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                  return p.createdAt > weekAgo;
                }).length}
              />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Formulaire de création */}
            {showCreateForm && user && (
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Créer une nouvelle discussion</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Titre de la discussion</label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Sujet de votre discussion..."
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contenu</label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Partagez vos pensées, questions ou expériences..."
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground h-32 resize-none"
                      maxLength={1000}
                      required
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {newPost.content.length}/1000 caractères
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isCreatingPost || !newPost.title.trim() || !newPost.content.trim()}
                    >
                      {isCreatingPost ? (
                        <>
                          <Spinner size="sm" />
                          Création...
                        </>
                      ) : (
                        'Publier la discussion'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Liste des discussions */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : filteredPosts.length === 0 ? (
                <EmptyState
                  title="Aucune discussion trouvée"
                  description={
                    searchQuery.trim() 
                      ? "Aucune discussion ne correspond à votre recherche."
                      : "Aucune discussion pour le moment."
                  }
                  action={
                    user ? (
                      <Button onClick={() => setShowCreateForm(true)}>
                        Créer la première discussion
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {post.authorPhotoURL && (
                        <img
                          src={post.authorPhotoURL}
                          alt={post.authorName}
                          className="w-12 h-12 rounded-full border border-border flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap flex-1">
                            {editingPostId === post.id ? (
                              <input
                                type="text"
                                value={editPostData.title}
                                onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                                className="flex-1 px-3 py-1 border border-border rounded-md bg-background text-foreground font-semibold"
                                placeholder="Titre de la discussion"
                              />
                            ) : (
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                            )}
                            {post.ideaTitle && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand">
                                💡 {post.ideaTitle}
                              </span>
                            )}
                          </div>
                          {user && user.uid === post.authorId && editingPostId !== post.id && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="text-xs text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-xs text-destructive hover:text-destructive/80 p-1 rounded transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        <span className="font-medium">{post.authorName}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {post.updatedAt !== post.createdAt && (
                          <>
                            <span>•</span>
                            <span className="text-xs italic">Modifié</span>
                          </>
                        )}
                      </div>

                      {editingPostId === post.id ? (
                        <div className="space-y-3 mb-4">
                          <textarea
                            value={editPostData.content}
                            onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground h-32 resize-none"
                            placeholder="Contenu de la discussion"
                            maxLength={1000}
                          />
                          <div className="text-xs text-muted-foreground">
                            {editPostData.content.length}/1000 caractères
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveEdit(post.id)}
                              disabled={!editPostData.title.trim() || !editPostData.content.trim()}
                            >
                              Enregistrer
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={handleCancelEdit}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground mb-4 whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>
                      )}

                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${
                              post.isLiked ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {post.likes} {post.likes === 1 ? 'J\'aime' : 'J\'aimes'}
                          </button>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comments} {post.comments === 1 ? 'commentaire' : 'commentaires'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
