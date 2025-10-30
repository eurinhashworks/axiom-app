import React, { useState, useMemo, useEffect } from 'react';
import { useIdeas } from '../contexts/IdeasContext';
import { Idea, IdeaStatus, Roadmap, Step } from '../types';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
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
import CompactView from '../components/dashboard/CompactView';
import DetailView from '../components/dashboard/DetailView';
import PriorityTimeline from '../components/dashboard/PriorityTimeline';
import { prioritizationService, PrioritizedIdea } from '../services/prioritizationService';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import SuperFocusModal from '@/components/dashboard/SuperFocusModal';
import ProgressAndNext from '@/components/dashboard/ProgressAndNext';
import TipsList from '@/components/dashboard/TipsList';
import Recommendations from '@/components/dashboard/Recommendations';
import IdeasSection from '@/components/dashboard/IdeasSection';
import SearchBar from '@/components/dashboard/SearchBar';
import FiltersBar from '@/components/dashboard/FiltersBar';
import SortAndSelectBar from '@/components/dashboard/SortAndSelectBar';
import DashboardHeaderActions from '@/components/dashboard/DashboardHeaderActions';
import QuickRoadmapCreator from '@/components/dashboard/QuickRoadmapCreator';

type SortOption = 'date-desc' | 'date-asc' | 'opportunity-desc' | 'opportunity-asc' | 'feasibility-desc' | 'feasibility-asc' | 'title-asc' | 'title-desc';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { ideas, addIdea, setActiveIdea } = useIdeas();
    const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
    const [isPrioritizing, setIsPrioritizing] = useState(false);
    const [prioritizationResult, setPrioritizationResult] = useState<string | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
    const [showPriorityTimeline, setShowPriorityTimeline] = useState(false);
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
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [progressPercent, setProgressPercent] = useState<number | null>(null);
    const [nextStepTitle, setNextStepTitle] = useState<string | null>(null);
    const [nextStepId, setNextStepId] = useState<string | null>(null);
    const [nextStepTips, setNextStepTips] = useState<string[]>([]);
    const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
    const [isSuperFocusOpen, setIsSuperFocusOpen] = useState(false);
    const [recommendedQuick, setRecommendedQuick] = useState<Step | null>(null);
    const [recommendedImpact, setRecommendedImpact] = useState<Step | null>(null);
    const [isRoadmapCreatorOpen, setIsRoadmapCreatorOpen] = useState(false);

    const recomputeRecommendations = (steps: Step[], completedIds: Set<string>) => {
        const remaining = steps.filter(s => !completedIds.has(s.id));
        if (remaining.length === 0) {
            setRecommendedQuick(null);
            setRecommendedImpact(null);
            return;
        }
        const quick = [...remaining].sort((a, b) => (a.estimateMinutes ?? 9999) - (b.estimateMinutes ?? 9999) || (a.order ?? 0) - (b.order ?? 0))[0];
        const byImpact = [...remaining].sort((a, b) => {
            const diffRank = (v?: 'easy'|'medium'|'hard') => v === 'hard' ? 3 : v === 'medium' ? 2 : 1;
            const dr = diffRank(b.difficulty) - diffRank(a.difficulty);
            if (dr !== 0) return dr;
            return (b.estimateMinutes ?? -1) - (a.estimateMinutes ?? -1);
        });
        const impact = byImpact[0];
        setRecommendedQuick(quick || null);
        setRecommendedImpact(impact || null);
    };

    // Fonction de chargement réutilisable
    const loadRoadmaps = async () => {
            try {
                if (!user) return;
                const rms = await firebaseService.getRoadmaps(user.uid);
                setRoadmaps(rms);
                if (rms.length > 0) {
                    const steps = await firebaseService.getSteps(rms[0].id);
                    setCurrentSteps(steps);
                    const progress = await firebaseService.getOrCreateProgress(user.uid, rms[0].id);
                    const done = new Set(progress.completedStepIds || []);
                    const next = steps.find(s => !done.has(s.id));
                    setNextStepTitle(next ? next.title : null);
                    setNextStepId(next ? next.id : null);
                    setNextStepTips(next?.tips || []);
                    recomputeRecommendations(steps, done);
                    const pct = await firebaseService.getProgressPercent(user.uid, rms[0].id);
                    setProgressPercent(pct);
                } else {
                    setProgressPercent(null);
                    setNextStepTitle(null);
                    setNextStepId(null);
                    setNextStepTips([]);
                    setCurrentSteps([]);
                    setRecommendedQuick(null);
                    setRecommendedImpact(null);
                }
            } catch (e) {
                console.error(e);
            }
    };

    // Charger roadmaps et progression de base (v1)
    useEffect(() => {
        loadRoadmaps();
    }, [user]);

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
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Tableau de Bord des Idées</h1>
                <DashboardHeaderActions 
                    isPrioritizing={isPrioritizing}
                    canPrioritize={ideas.filter(i => i.status === 'EVALUATED' || i.status === 'ROADMAP_GENERATED').length >= 2}
                    onPrioritize={handlePrioritize}
                    onNewIdea={() => setIsNewIdeaModalOpen(true)}
                />
            </div>

            <ProgressAndNext 
                progressPercent={progressPercent}
                roadmapTitle={roadmaps.length > 0 ? roadmaps[0].title : null}
                nextStepTitle={nextStepTitle}
                onStartNext={() => setIsSuperFocusOpen(true)}
            />

            {roadmaps.length === 0 && (
                <div className="p-6 rounded-lg border border-border bg-muted/30 text-center">
                    <div className="text-lg font-semibold mb-2">Créez votre première roadmap</div>
                    <div className="text-sm text-muted-foreground mb-4">
                        Organisez votre projet en étapes claires et progressez vers vos objectifs.
                    </div>
                    <Button onClick={() => setIsRoadmapCreatorOpen(true)}>Créer une roadmap</Button>
                </div>
            )}

            <TipsList tips={nextStepTips} />

            <Recommendations 
                quick={recommendedQuick || undefined}
                impact={recommendedImpact || undefined}
                onSelect={(step) => {
                    setNextStepTitle(step.title);
                    setNextStepId(step.id);
                    setNextStepTips(step.tips || []);
                    setIsSuperFocusOpen(true);
                }}
            />

            {/* Barre de recherche et contrôles */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <FiltersBar ideas={ideas} filters={filters} onFiltersChange={setFilters} />
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
                        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
                    </div>
                </div>

                {/* Tri et sélection */}
                <SortAndSelectBar
                    sortBy={sortBy}
                    onSortChange={(v) => setSortBy(v)}
                    totalCount={filteredAndSortedIdeas.length}
                    searchQuery={searchQuery}
                    allSelected={selectedIdeas.size === filteredAndSortedIdeas.length && filteredAndSortedIdeas.length > 0}
                    hasItems={filteredAndSortedIdeas.length > 0}
                    onSelectAll={handleSelectAll}
                />

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

            {/* Timeline de priorité */}
            {showPriorityTimeline && prioritizationData.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Timeline des Priorités</h2>
                    <PriorityTimeline 
                        prioritizedIdeas={prioritizationData}
                        timeline={[]}
                        recommendations={{
                            immediate: prioritizationData.slice(0, 3),
                            thisWeek: prioritizationData.slice(3, 6),
                            thisMonth: prioritizationData.slice(6, 10),
                            later: prioritizationData.slice(10)
                        }}
                        onSelectIdea={handleSelectPrioritizedIdea}
                    />
                </div>
            )}

            <IdeasSection
                ideas={filteredAndSortedIdeas}
                viewMode={viewMode}
                selectedIds={selectedIdeas}
                onToggleSelection={handleToggleSelection}
                onSelectIdea={handleSelectIdea}
                isFilteredOrSearched={!!searchQuery || filters.status !== 'all'}
                onNewIdea={() => setIsNewIdeaModalOpen(true)}
            />

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

            {/* Super Focus */}
            <SuperFocusModal
                isOpen={isSuperFocusOpen}
                onClose={() => setIsSuperFocusOpen(false)}
                stepTitle={nextStepTitle || ''}
                tips={nextStepTips}
                onComplete={async () => {
                    try {
                        if (!user || roadmaps.length === 0 || !nextStepId) return;
                        await firebaseService.markStepDone(user.uid, roadmaps[0].id, nextStepId);
                        // rafraîchir progression et prochaine étape
                        const steps = await firebaseService.getSteps(roadmaps[0].id);
                        const progress = await firebaseService.getOrCreateProgress(user.uid, roadmaps[0].id);
                        const done = new Set(progress.completedStepIds || []);
                        const next = steps.find(s => !done.has(s.id));
                        setCurrentSteps(steps);
                        setNextStepTitle(next ? next.title : null);
                        setNextStepId(next ? next.id : null);
                        setNextStepTips(next?.tips || []);
                        const pct = await firebaseService.getProgressPercent(user.uid, roadmaps[0].id);
                        setProgressPercent(pct);
                        setIsSuperFocusOpen(false);
                        showToast('Étape marquée comme terminée', 'success');
                    } catch (e) {
                        console.error(e);
                        showToast('Erreur lors de la mise à jour de la progression', 'error');
                    }
                }}
            />

            {/* Quick Roadmap Creator */}
            <QuickRoadmapCreator
                isOpen={isRoadmapCreatorOpen}
                onClose={() => setIsRoadmapCreatorOpen(false)}
                onSuccess={() => {
                    loadRoadmaps();
                }}
            />
        </div>
    );
};

export default DashboardPage;
