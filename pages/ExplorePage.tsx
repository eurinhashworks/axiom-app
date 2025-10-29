import React, { useEffect, useState, useCallback } from 'react';
import { Idea } from '../types';
import { firebaseService } from '../services/firebaseService';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import PublicIdeaDetailModal from '../components/dashboard/PublicIdeaDetailModal';
import Card from '../components/ui/Card';

const IDEAS_PER_PAGE = 20;

const ExplorePage: React.FC = () => {
  const [allPublicIdeas, setAllPublicIdeas] = useState<Idea[]>([]);
  const [displayedIdeas, setDisplayedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'evaluated'>('all');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  // Charger toutes les idées (pagination côté client)
  useEffect(() => {
    setLoading(true);
    // Charger toutes les idées en une fois pour la pagination côté client
    firebaseService.getAllPublicIdeas()
      .then(ideas => {
        setAllPublicIdeas(ideas);
        setDisplayedIdeas(ideas.slice(0, IDEAS_PER_PAGE));
        setHasMore(ideas.length > IDEAS_PER_PAGE);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading ideas:', error);
        setLoading(false);
      });
  }, []);

  // Charger plus d'idées (pagination côté client)
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || displayedIdeas.length >= allPublicIdeas.length) return;

    setLoadingMore(true);
    
    // Simuler un petit délai pour l'animation
    setTimeout(() => {
      const nextPage = displayedIdeas.length + IDEAS_PER_PAGE;
      setDisplayedIdeas(allPublicIdeas.slice(0, nextPage));
      setHasMore(nextPage < allPublicIdeas.length);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore, displayedIdeas.length, allPublicIdeas]);

  const filteredIdeas = filter === 'evaluated' 
    ? displayedIdeas.filter(idea => idea.opportunityScore && idea.feasibilityScore)
    : displayedIdeas;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-muted-foreground">Chargement des idées publiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent">
            Explorer les Idées
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Découvrez les idées partagées par la communauté AXIOM
            {allPublicIdeas.length > 0 && (
              <span className="ml-1 sm:ml-2 text-brand font-semibold">
                ({allPublicIdeas.length} idées disponibles)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            className="text-sm flex-1 sm:flex-initial"
          >
            Toutes
          </Button>
          <Button
            variant={filter === 'evaluated' ? 'primary' : 'secondary'}
            onClick={() => setFilter('evaluated')}
            className="text-sm flex-1 sm:flex-initial"
          >
            Évaluées
          </Button>
        </div>
      </div>

      {filteredIdeas.length === 0 ? (
        <EmptyState
          title={allPublicIdeas.length === 0 ? "Aucune idée publique" : "Aucune idée évaluée"}
          description={
            allPublicIdeas.length === 0
              ? "Il n'y a pas encore d'idées partagées publiquement. Soyez le premier à partager votre idée !"
              : "Aucune idée évaluée n'est actuellement publique. Revenez plus tard pour voir de nouvelles idées."
          }
        />
      ) : (
        <>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>
              {filteredIdeas.length} idée(s) affichée(s)
              {displayedIdeas.length < allPublicIdeas.length && (
                <span className="ml-1 sm:ml-2">sur {allPublicIdeas.length}</span>
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredIdeas.map(idea => (
              <PublicIdeaCard key={idea.id} idea={idea} onSelect={() => setSelectedIdea(idea)} />
            ))}
          </div>

          {/* Bouton "Charger plus" */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={loadingMore}
                isLoading={loadingMore}
                className="w-full sm:w-auto min-w-[200px]"
              >
                {loadingMore ? 'Chargement...' : 'Charger plus d\'idées'}
              </Button>
            </div>
          )}

          {/* Message de fin */}
          {!hasMore && displayedIdeas.length > 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              <p>Toutes les idées ont été chargées ({displayedIdeas.length} / {allPublicIdeas.length})</p>
            </div>
          )}

          {selectedIdea && (
            <PublicIdeaDetailModal
              idea={selectedIdea}
              isOpen={!!selectedIdea}
              onClose={() => setSelectedIdea(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

interface PublicIdeaCardProps {
  idea: Idea;
  onSelect: () => void;
}

const PublicIdeaCard: React.FC<PublicIdeaCardProps> = ({ idea, onSelect }) => {
  return (
    <Card className="flex flex-col justify-between hover:shadow-xl hover:border-brand transition-all cursor-pointer h-full group relative overflow-hidden" onClick={onSelect}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-foreground pr-2 group-hover:text-brand transition-colors flex-1">
            {idea.title}
          </h3>
        </div>

        {/* Auteur */}
        {idea.authorName && (
          <div className="flex items-center gap-2 mb-3">
            {idea.authorPhotoURL && (
              <img
                src={idea.authorPhotoURL}
                alt={idea.authorName}
                className="w-6 h-6 rounded-full border border-border"
              />
            )}
            <span className="text-xs text-muted-foreground">{idea.authorName}</span>
          </div>
        )}

        {idea.analysis?.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {idea.analysis.summary}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 relative z-10">
        {idea.opportunityScore && (
          <div className="text-xs px-2 py-1 rounded-full font-semibold bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
            Opp: <strong>{idea.opportunityScore.toFixed(1)}</strong>
          </div>
        )}
        {idea.feasibilityScore && (
          <div className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
            Fais: <strong>{idea.feasibilityScore.toFixed(1)}</strong>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExplorePage;
