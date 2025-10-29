import React, { useState, useMemo } from 'react';
import { useIdeas } from '../contexts/IdeasContext';
import { Idea, IdeaStatus } from '../types';
import * as geminiService from '../services/geminiService';
import Button from '../components/ui/Button';
import IdeaCard from '../components/dashboard/IdeaCard';
import IdeaCardEnhanced from '../components/dashboard/IdeaCardEnhanced';
import NewIdeaModal from '../components/dashboard/NewIdeaModal';
import PrioritizationResultModal from '../components/dashboard/PrioritizationResultModal';
import IdeaDetailModal from '../components/dashboard/IdeaDetailModal';
import GraphView from '../components/dashboard/GraphView';
import AdvancedFilters, { FilterState } from '../components/dashboard/AdvancedFilters';
import ViewToggle, { ViewMode } from '../components/dashboard/ViewToggle';
import QuickActions from '../components/dashboard/QuickActions';
import KanbanView from '../components/dashboard/KanbanView';
import CompactView from '../components/dashboard/CompactView';
import DetailView from '../components/dashboard/DetailView';
import PriorityTimeline from '../components/dashboard/PriorityTimeline';
import { prioritizationService, PrioritizedIdea } from '../services/prioritizationService';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

type SortOption = 'date-desc' | 'date-asc' | 'opportunity-desc' | 'opportunity-asc' | 'feasibility-desc' | 'feasibility-asc' | 'title-asc' | 'title-desc';

const DashboardPage: React.FC = () => {
    const { ideas, addIdea, setActiveIdea } = useIdeas();
    const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
    const [isPrioritizing, setIsPrioritizing] = useState(false);
    const [prioritizationResult, setPrioritizationResult] = useState<string | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        minOpportunity: 0,
        maxOpportunity: 10,
        minFeasibility: 0,
        maxFeasibility: 10,
        technologies: [],
        tags: [],
        dateRange: { start: '', end: '' },
        hasRoadmap: null,
        hasAnalysis: null
    });
    const { showToast } = useToast();

    const handleCreateNewIdea = async (title: string) => {
        try {
            await addIdea(title);
            setIsNewIdeaModalOpen(false);
        } catch (error) {
            console.error('Error creating idea:', error);
            // Le toast d'erreur est déjà géré dans IdeasContext
        }
    };

    const handleSelectIdea = (idea: Idea) => {
        setSelectedIdea(idea);
    };

    const handleSelectPrioritizedIdea = (idea: PrioritizedIdea) => {
        setSelectedIdea(idea);
    };

    const handleSelectPrioritizedIdea = (idea: PrioritizedIdea) => {
        setSelectedIdea(idea);
    };

    const handleToggleSelection = (ideaId: string) => {
        setSelectedIdeas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ideaId)) {
                newSet.delete(ideaId);
            } else {
                newSet.add(ideaId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedIdeas.size === filteredAndSortedIdeas.length) {
            setSelectedIdeas(new Set());
        } else {
            setSelectedIdeas(new Set(filteredAndSortedIdeas.map(idea => idea.id)));
        }
    };

    const handleNavigateToSession = () => {
        if (selectedIdea) {
            setActiveIdea(selectedIdea);
            window.location.hash = '#session';
        }
    };

    const handlePrioritize = async () => {
        const evaluatedIdeas = ideas.filter(idea => idea.status === 'EVALUATED' || idea.status === 'ROADMAP_GENERATED');
        if (evaluatedIdeas.length < 2) {
            showToast('Vous avez besoin d\'au moins deux idées évaluées pour les prioriser.', 'warning');
            return;
        }
        setIsPrioritizing(true);
        try {
            const result = await geminiService.prioritizeIdeas(evaluatedIdeas);
            setPrioritizationResult(result);
            showToast('Priorisation terminée avec succès !', 'success');
        } catch (error) {
            console.error("Failed to prioritize ideas:", error);
            showToast('Une erreur est survenue lors de la priorisation des idées.', 'error');
        } finally {
            setIsPrioritizing(false);
        }
    };

    const evaluatedIdeas = ideas.filter(idea => idea.opportunityScore !== undefined && idea.feasibilityScore !== undefined);

    // Filtrage et tri
    // Calculer la priorisation automatique
    const prioritizationData = useMemo(() => {
        return prioritizationService.prioritizeIdeas(ideas);
    }, [ideas]);

    const filteredAndSortedIdeas = useMemo(() => {
        let filtered = ideas;

        // Filtre par recherche
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(idea => 
                idea.title.toLowerCase().includes(query) ||
                idea.analysis?.summary?.toLowerCase().includes(query) ||
                idea.brainDump.toLowerCase().includes(query)
            );
        }

        // Filtres avancés
        if (filters.status !== 'all') {
            filtered = filtered.filter(idea => idea.status === filters.status);
        }

        // Filtre par scores
        filtered = filtered.filter(idea => {
            if (idea.opportunityScore !== undefined) {
                if (idea.opportunityScore < filters.minOpportunity || idea.opportunityScore > filters.maxOpportunity) {
                    return false;
                }
            }
            if (idea.feasibilityScore !== undefined) {
                if (idea.feasibilityScore < filters.minFeasibility || idea.feasibilityScore > filters.maxFeasibility) {
                    return false;
                }
            }
            return true;
        });

        // Filtre par technologies
        if (filters.technologies.length > 0) {
            filtered = filtered.filter(idea => {
                const ideaTechs = [
                    ...(idea.evaluation?.recommendedTechnologies || []).map(t => t.name),
                    ...(idea.evaluation?.recommendedDatabases || []).map(t => t.name)
                ];
                return filters.technologies.some(tech => ideaTechs.includes(tech));
            });
        }

        // Filtre par tags
        if (filters.tags.length > 0) {
            filtered = filtered.filter(idea => {
                const ideaTags = [
                    ...(idea.evaluation?.recommendedTechnologies || []).map(t => t.category),
                    ...(idea.evaluation?.recommendedDatabases || []).map(t => t.category)
                ];
                return filters.tags.some(tag => ideaTags.includes(tag));
            });
        }

        // Filtre par plage de dates
        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start).getTime();
            filtered = filtered.filter(idea => idea.createdAt >= startDate);
        }
        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end).getTime() + 24 * 60 * 60 * 1000; // +1 jour
            filtered = filtered.filter(idea => idea.createdAt < endDate);
        }

        // Filtre par contenu
        if (filters.hasAnalysis !== null) {
            filtered = filtered.filter(idea => filters.hasAnalysis ? !!idea.analysis : !idea.analysis);
        }
        if (filters.hasRoadmap !== null) {
            filtered = filtered.filter(idea => filters.hasRoadmap ? !!idea.roadmapSteps : !idea.roadmapSteps);
        }

        // Exclure les idées archivées
        filtered = filtered.filter(idea => !idea.isArchived);

        // Tri
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return b.createdAt - a.createdAt;
                case 'date-asc':
                    return a.createdAt - b.createdAt;
                case 'opportunity-desc':
                    return (b.opportunityScore || 0) - (a.opportunityScore || 0);
                case 'opportunity-asc':
                    return (a.opportunityScore || 0) - (b.opportunityScore || 0);
                case 'feasibility-desc':
                    return (b.feasibilityScore || 0) - (a.feasibilityScore || 0);
                case 'feasibility-asc':
                    return (a.feasibilityScore || 0) - (b.feasibilityScore || 0);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [ideas, searchQuery, filters, sortBy]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Tableau de Bord des Idées
                </h1>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button 
                        onClick={handlePrioritize} 
                        disabled={isPrioritizing || ideas.filter(i => i.status === 'EVALUATED' || i.status === 'ROADMAP_GENERATED').length < 2}
                        variant="secondary"
                        className="transition-all hover:scale-105 active:scale-95"
                    >
                        {isPrioritizing ? <Spinner/> : "Prioriser les Idées"}
                    </Button>
                    <Button 
                        onClick={() => setIsNewIdeaModalOpen(true)}
                        className="transition-all hover:scale-105 active:scale-95"
                    >
                        + Nouvelle Idée
                    </Button>
                </div>
            </div>

            {/* Barre de recherche et contrôles */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Recherche */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Rechercher une idée..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                        />
                        <svg 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Contrôles */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <AdvancedFilters 
                            ideas={ideas}
                            onFiltersChange={setFilters}
                            onClearFilters={() => setFilters({
                                status: 'all',
                                minOpportunity: 0,
                                maxOpportunity: 10,
                                minFeasibility: 0,
                                maxFeasibility: 10,
                                technologies: [],
                                tags: [],
                                dateRange: { start: '', end: '' },
                                hasRoadmap: null,
                                hasAnalysis: null
                            })}
                        />
                        
                        <Button
                            variant={showPriorityTimeline ? 'primary' : 'secondary'}
                            onClick={() => setShowPriorityTimeline(!showPriorityTimeline)}
                            className="text-sm flex-1 sm:flex-initial"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="hidden sm:inline">Priorités</span>
                            <span className="sm:hidden">Priorités</span>
                        </Button>
                        
                        <ViewToggle 
                            currentView={viewMode}
                            onViewChange={setViewMode}
                        />
                    </div>
                </div>

                {/* Tri et sélection */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="flex-1 sm:flex-initial px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm min-w-[140px]"
                        >
                            <option value="date-desc">Date (récent)</option>
                            <option value="date-asc">Date (ancien)</option>
                            <option value="title-asc">Titre (A-Z)</option>
                            <option value="title-desc">Titre (Z-A)</option>
                            <option value="opportunity-desc">Opportunité (haut)</option>
                            <option value="opportunity-asc">Opportunité (bas)</option>
                            <option value="feasibility-desc">Faisabilité (haut)</option>
                            <option value="feasibility-asc">Faisabilité (bas)</option>
                        </select>

                        {filteredAndSortedIdeas.length > 0 && (
                            <Button
                                variant="secondary"
                                onClick={handleSelectAll}
                                className="text-sm w-full sm:w-auto flex-1 sm:flex-initial"
                            >
                                <span className="hidden sm:inline">
                                    {selectedIdeas.size === filteredAndSortedIdeas.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                </span>
                                <span className="sm:hidden">
                                    {selectedIdeas.size === filteredAndSortedIdeas.length ? 'Désélectionner' : 'Sélectionner'}
                                </span>
                            </Button>
                        )}
                    </div>

                    {/* Compteur de résultats */}
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                        {filteredAndSortedIdeas.length} idée(s)
                        {searchQuery && (
                            <span className="hidden sm:inline"> trouvée(s) pour "{searchQuery}"</span>
                        )}
                    </div>
                </div>

                {/* Actions rapides */}
                {selectedIdeas.size > 0 && (
                    <QuickActions
                        selectedIdeas={filteredAndSortedIdeas.filter(idea => selectedIdeas.has(idea.id))}
                        onIdeasChange={() => {
                            setSelectedIdeas(new Set());
                            // Force re-render
                        }}
                    />
                )}
            </div>

            {evaluatedIdeas.length > 0 && <GraphView ideas={evaluatedIdeas} onSelectIdea={handleSelectIdea} />}

            <h2 className="text-2xl font-bold mt-8">Toutes les idées</h2>
            {filteredAndSortedIdeas.length > 0 ? (
                <>
                    {viewMode === 'kanban' && (
                        <KanbanView 
                            ideas={filteredAndSortedIdeas} 
                            onSelectIdea={handleSelectIdea} 
                        />
                    )}
                    {viewMode === 'compact' && (
                        <CompactView 
                            ideas={filteredAndSortedIdeas} 
                            onSelectIdea={handleSelectIdea} 
                        />
                    )}
                    {viewMode === 'detail' && (
                        <DetailView 
                            ideas={filteredAndSortedIdeas} 
                            onSelectIdea={handleSelectIdea} 
                        />
                    )}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filteredAndSortedIdeas.map(idea => (
                                <IdeaCardEnhanced 
                                    key={idea.id} 
                                    idea={idea} 
                                    onSelect={() => handleSelectIdea(idea)}
                                    showSelection={true}
                                    isSelected={selectedIdeas.has(idea.id)}
                                    onToggleSelection={() => handleToggleSelection(idea.id)}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <EmptyState
                    title={searchQuery || filters.status !== 'all' ? "Aucune idée correspondante" : "Aucune idée pour le moment"}
                    description={
                        searchQuery || filters.status !== 'all'
                            ? "Essayez de modifier vos critères de recherche ou de filtres."
                            : "Commencez à transformer vos idées en opportunités stratégiques. Créez votre première idée pour démarrer l'analyse."
                    }
                    action={
                        !searchQuery && filters.status === 'all' ? {
                            label: "+ Nouvelle Idée",
                            onClick: () => setIsNewIdeaModalOpen(true)
                        } : undefined
                    }
                />
            )}

            {isNewIdeaModalOpen && (
                <NewIdeaModal
                    onClose={() => setIsNewIdeaModalOpen(false)}
                    onSubmit={handleCreateNewIdea}
                />
            )}

            {prioritizationResult && (
                <PrioritizationResultModal
                    result={prioritizationResult}
                    onClose={() => setPrioritizationResult(null)}
                />
            )}

            {selectedIdea && (
                <IdeaDetailModal
                    idea={selectedIdea}
                    isOpen={!!selectedIdea}
                    onClose={() => setSelectedIdea(null)}
                    onNavigateToSession={handleNavigateToSession}
                />
            )}
        </div>
    );
};

export default DashboardPage;
