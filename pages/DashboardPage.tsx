import React, { useState } from 'react';
import { useIdeas } from '../contexts/IdeasContext';
import { Idea } from '../types';
import * as geminiService from '../services/geminiService';
import Button from '../components/ui/Button';
import IdeaCard from '../components/dashboard/IdeaCard';
import NewIdeaModal from '../components/dashboard/NewIdeaModal';
import PrioritizationResultModal from '../components/dashboard/PrioritizationResultModal';
import GraphView from '../components/dashboard/GraphView';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

const DashboardPage: React.FC = () => {
    const { ideas, addIdea, setActiveIdea } = useIdeas();
    const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
    const [isPrioritizing, setIsPrioritizing] = useState(false);
    const [prioritizationResult, setPrioritizationResult] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleCreateNewIdea = (title: string) => {
        addIdea(title);
        setIsNewIdeaModalOpen(false);
    };

    const handleSelectIdea = (idea: Idea) => {
        setActiveIdea(idea);
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

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Tableau de Bord des Idées
                </h1>
                <div className="flex gap-2">
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

            {evaluatedIdeas.length > 0 && <GraphView ideas={evaluatedIdeas} onSelectIdea={handleSelectIdea} />}

            <h2 className="text-2xl font-bold mt-8">Toutes les idées</h2>
            {ideas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ideas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} onSelect={() => handleSelectIdea(idea)} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="Aucune idée pour le moment"
                    description="Commencez à transformer vos idées en opportunités stratégiques. Créez votre première idée pour démarrer l'analyse."
                    action={{
                        label: "+ Nouvelle Idée",
                        onClick: () => setIsNewIdeaModalOpen(true)
                    }}
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
        </div>
    );
};

export default DashboardPage;
