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
import Button from '../components/ui/Button';

const SessionPage: React.FC = () => {
    const { activeIdea, updateIdea, setActiveIdea } = useIdeas();
    const [inputMethod, setInputMethod] = useState<'text' | 'voice' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        // If an idea is loaded that has already passed the DRAFT stage,
        // we don't need to ask for input method.
        if (activeIdea && activeIdea.status !== 'DRAFT') {
            setInputMethod('text'); // or some default, it doesn't matter
        } else {
            setInputMethod(null);
        }
    }, [activeIdea]);

    const handleBrainDumpSubmit = async (brainDump: string) => {
        if (!activeIdea) return;
        setIsLoading(true);
        updateIdea(activeIdea.id, { brainDump, status: 'ANALYZING' });

        try {
            const analysis = await geminiService.analyzeBrainDump(brainDump);
            updateIdea(activeIdea.id, { analysis, status: 'ANALYZED' });
        } catch (error) {
            console.error("Failed to analyze idea:", error);
            // Revert status on failure
            updateIdea(activeIdea.id, { status: 'DRAFT' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!activeIdea) {
        return (
            <div className="text-center">
                <p>Aucune idée active sélectionnée.</p>
                <Button onClick={() => setActiveIdea(null)}>Retour au Tableau de Bord</Button>
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
        <div className="flex h-[calc(100vh-105px)]">
            <SessionSidebar idea={activeIdea} />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{activeIdea.title}</h1>
                    <Button variant="secondary" onClick={() => setIsExporting(true)}>Exporter</Button>
                </div>
                {renderContent()}
            </main>
            {isExporting && <ExportModal idea={activeIdea} onClose={() => setIsExporting(false)} />}
        </div>
    );
};

export default SessionPage;
