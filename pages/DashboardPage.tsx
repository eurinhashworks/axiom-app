import React, { useState, useEffect } from 'react';
import { useIdeas } from '../contexts/IdeasContext';
import { Idea, IdeaStatus, Roadmap, Step } from '../types';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import ProjectBoard from '../components/dashboard/ProjectBoard';
import NewIdeaModal from '../components/dashboard/NewIdeaModal';
import IdeaDetailModal from '../components/dashboard/IdeaDetailModal';
import SuperFocusModal from '@/components/dashboard/SuperFocusModal';
import { useToast } from '../contexts/ToastContext';
import QuickRoadmapCreator from '@/components/dashboard/QuickRoadmapCreator';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { ideas, addIdea, updateIdea, setActiveIdea } = useIdeas();
    const { showToast } = useToast();

    // Modals State
    const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [isSuperFocusOpen, setIsSuperFocusOpen] = useState(false);
    const [isRoadmapCreatorOpen, setIsRoadmapCreatorOpen] = useState(false);

    // Roadmap & Progress State
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [nextStepTitle, setNextStepTitle] = useState<string | null>(null);
    const [nextStepId, setNextStepId] = useState<string | null>(null);
    const [nextStepTips, setNextStepTips] = useState<string[]>([]);
    const [progressPercent, setProgressPercent] = useState<number | null>(null);

    // Load Roadmaps
    const loadRoadmaps = async () => {
        try {
            if (!user) return;
            const rms = await firebaseService.getRoadmaps(user.uid);
            setRoadmaps(rms);
            if (rms.length > 0) {
                const steps = await firebaseService.getSteps(rms[0].id);
                const progress = await firebaseService.getOrCreateProgress(user.uid, rms[0].id);
                const done = new Set(progress.completedStepIds || []);
                const next = steps.find(s => !done.has(s.id));

                setNextStepTitle(next ? next.title : null);
                setNextStepId(next ? next.id : null);
                setNextStepTips(next?.tips || []);

                const pct = await firebaseService.getProgressPercent(user.uid, rms[0].id);
                setProgressPercent(pct);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadRoadmaps();
    }, [user]);

    // Handlers
    const handleCreateNewIdea = async (title: string) => {
        try {
            await addIdea(title);
            setIsNewIdeaModalOpen(false);
            showToast('Idée créée avec succès', 'success');
        } catch (error) {
            console.error('Error creating idea:', error);
        }
    };

    const handleUpdateStatus = async (ideaId: string, newStatus: IdeaStatus) => {
        try {
            await updateIdea(ideaId, { status: newStatus });
            showToast('Statut mis à jour', 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Erreur lors de la mise à jour', 'error');
        }
    };

    const handleNavigateToSession = () => {
        if (selectedIdea) {
            setActiveIdea(selectedIdea);
            window.location.hash = '#session';
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col space-y-6 p-4 md:p-8 animate-fade-in">
            {/* Top Section: Active Focus (Optional but good for context) */}
            {roadmaps.length > 0 && nextStepTitle && (
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-700"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-blue-500 transition-all duration-1000 ease-out"
                                    strokeDasharray={`${progressPercent || 0}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold text-blue-400">{Math.round(progressPercent || 0)}%</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Focus Actuel</h3>
                            <p className="text-lg font-bold text-white">{nextStepTitle}</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsSuperFocusOpen(true)} variant="primary" className="shadow-lg shadow-blue-600/20">
                        Continuer
                    </Button>
                </div>
            )}

            {/* Main Project Board */}
            <div className="flex-1 min-h-0">
                <ProjectBoard
                    ideas={ideas}
                    onSelectIdea={setSelectedIdea}
                    onNewIdea={() => setIsNewIdeaModalOpen(true)}
                    onUpdateStatus={handleUpdateStatus}
                />
            </div>

            {/* Modals */}
            {isNewIdeaModalOpen && (
                <NewIdeaModal
                    onClose={() => setIsNewIdeaModalOpen(false)}
                    onSubmit={handleCreateNewIdea}
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

            <SuperFocusModal
                isOpen={isSuperFocusOpen}
                onClose={() => setIsSuperFocusOpen(false)}
                stepTitle={nextStepTitle || ''}
                tips={nextStepTips}
                onComplete={async () => {
                    try {
                        if (!user || roadmaps.length === 0 || !nextStepId) return;
                        await firebaseService.markStepDone(user.uid, roadmaps[0].id, nextStepId);
                        await loadRoadmaps();
                        setIsSuperFocusOpen(false);
                        showToast('Étape terminée !', 'success');
                    } catch (e) {
                        console.error(e);
                        showToast('Erreur lors de la mise à jour', 'error');
                    }
                }}
            />

            <QuickRoadmapCreator
                isOpen={isRoadmapCreatorOpen}
                onClose={() => setIsRoadmapCreatorOpen(false)}
                onSuccess={loadRoadmaps}
            />
        </div>
    );
};

export default DashboardPage;
