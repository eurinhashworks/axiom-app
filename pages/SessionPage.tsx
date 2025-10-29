import React, { useState, useEffect } from 'react';
import { useIdeas } from '../contexts/IdeasContext';
import * as geminiService from '../services/geminiService';
import InputSelection from '../components/session/InputSelection';
import ChatBot from '../components/ChatBot';
import LiveConversation from '../components/LiveConversation';
import SessionSidebar from '../components/session/SessionSidebar';
import AnalysisInProgress from '../components/session/AnalysisInProgress';
import AnalysisComplete from '../components/session/AnalysisComplete';
import ExportModal from '../components/session/ExportModal';
import ShareIdeaButton from '../components/session/ShareIdeaButton';
import EditIdeaModal from '../components/dashboard/EditIdeaModal';
import UserGuidance from '../components/session/UserGuidance';
import QuickActions from '../components/session/QuickActions';
import Button from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { handleAPIError } from '../utils/errorHandler';

const SessionPage: React.FC = () => {
    const { activeIdea, updateIdea, setActiveIdea, addIdea } = useIdeas();
    const { showToast } = useToast();
    const [inputMethod, setInputMethod] = useState<'text' | 'voice' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (activeIdea && activeIdea.status !== 'DRAFT') {
            setInputMethod('text');
        } else {
            setInputMethod(null);
        }
    }, [activeIdea]);

    const handleBrainDumpSubmit = async (brainDump: string) => {
        if (!activeIdea) return;
        setIsLoading(true);
        try {
            await updateIdea(activeIdea.id, { brainDump, status: 'ANALYZING' });
            const analysis = await geminiService.analyzeBrainDump(brainDump);
            await updateIdea(activeIdea.id, { analysis, status: 'ANALYZED' });
            showToast('Analyse terminée avec succès !', 'success');
        } catch (error) {
            const errorInfo = handleAPIError(error);
            console.error("Failed to analyze idea:", error);
            showToast(errorInfo.message, 'error');
            try {
                await updateIdea(activeIdea.id, { status: 'DRAFT' });
            } catch (revertError) {
                console.error("Failed to revert status:", revertError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuidanceAction = async (action: string) => {
        if (!activeIdea) return;

        switch (action) {
            case 'start-input':
                setInputMethod('text');
                break;
            case 'evaluate':
                // L'action sera gérée par AnalysisView
                break;
            case 'generate-roadmap':
                // L'action sera gérée par EvaluationView
                break;
            case 'new-idea':
                try {
                    await addIdea('Nouvelle idée');
                    showToast('Nouvelle idée créée !', 'success');
                } catch (error) {
                    showToast('Erreur lors de la création', 'error');
                }
                break;
            case 'dashboard':
                setActiveIdea(null);
                window.location.hash = '#dashboard';
                break;
            case 'share':
                // Géré par ShareIdeaButton
                break;
            case 'edit':
                setIsEditing(true);
                break;
            case 'export':
                setIsExporting(true);
                break;
            case 'review-analysis':
                // Scroll vers l'analyse
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'view-scores':
                // Scroll vers l'évaluation
                const evaluationSection = document.querySelector('[data-section="evaluation"]');
                evaluationSection?.scrollIntoView({ behavior: 'smooth' });
                break;
        }
    };

    if (!activeIdea) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Aucune idée active sélectionnée.</p>
                    <Button onClick={() => setActiveIdea(null)}>Retour au Tableau de Bord</Button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (activeIdea.status === 'ANALYZING') {
            return <AnalysisInProgress />;
        }
        
        if (activeIdea.status === 'DRAFT') {
            if (!inputMethod) {
                return <InputSelection onSelect={setInputMethod} />;
            }
            if (inputMethod === 'text') {
                return <ChatBot onSubmit={handleBrainDumpSubmit} isLoading={isLoading} />;
            }
            if (inputMethod === 'voice') {
                return <LiveConversation onSubmit={handleBrainDumpSubmit} isLoading={isLoading} />;
            }
        }

        return <AnalysisComplete idea={activeIdea} />;
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-105px)] lg:h-[calc(100vh-105px)]">
            <SessionSidebar idea={activeIdea} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold break-words">{activeIdea.title}</h1>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsEditing(true)}
                            className="text-sm flex-1 sm:flex-initial"
                        >
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Modifier</span>
                            <span className="sm:hidden">Mod.</span>
                        </Button>
                        {activeIdea.status !== 'DRAFT' && <ShareIdeaButton idea={activeIdea} />}
                        <Button variant="secondary" onClick={() => setIsExporting(true)} className="flex-1 sm:flex-initial">
                            <span className="hidden sm:inline">Exporter</span>
                            <span className="sm:hidden">Export</span>
                        </Button>
                    </div>
                </div>

                {/* Guidance utilisateur */}
                <div className="mb-4 sm:mb-6">
                    <UserGuidance idea={activeIdea} onAction={handleGuidanceAction} />
                </div>

                {/* Actions rapides */}
                {activeIdea.status !== 'DRAFT' && activeIdea.status !== 'ANALYZING' && (
                    <div className="mb-4 sm:mb-6">
                        <QuickActions idea={activeIdea} onAction={handleGuidanceAction} />
                    </div>
                )}

                {renderContent()}
            </main>
            {isExporting && <ExportModal idea={activeIdea} onClose={() => setIsExporting(false)} />}
            {isEditing && (
                <EditIdeaModal 
                    idea={activeIdea} 
                    isOpen={isEditing} 
                    onClose={() => setIsEditing(false)} 
                />
            )}
        </div>
    );
};

export default SessionPage;
