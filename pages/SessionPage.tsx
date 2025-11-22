import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { handleAPIError } from '../utils/errorHandler';
import Spinner from '../components/ui/Spinner';

// Define types for clarity
interface ExtractedIdea {
    title: string;
    startingQuestion: string;
}

const SessionPage: React.FC = () => {
    const [brainDump, setBrainDump] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<{ extractedIdeas: ExtractedIdea[] } | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<ExtractedIdea | null>(null);
    
    const { user } = useAuth();
    const { showToast } = useToast();

    const handleStartAnalysis = async () => {
        if (!user) {
            showToast("Vous devez être connecté pour lancer une analyse.", "error");
            return;
        }
        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const result = await apiClient.analyzeBrainDump(brainDump, undefined, token);
            setAnalysis(result);
            showToast("Analyse terminée !", "success");
        } catch (error) {
            const errorInfo = handleAPIError(error);
            showToast(errorInfo.message, 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setBrainDump('');
        setAnalysis(null);
        setSelectedIdea(null);
    };
    
    // STEP 3: Dialogue view (placeholder for now)
    if (selectedIdea) {
        return (
            <div className="max-w-4xl mx-auto py-8 text-center">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">Focus : {selectedIdea.title}</h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10">
                    {selectedIdea.startingQuestion}
                </p>
                <Textarea placeholder="Votre réponse..." className="min-h-[150px] text-lg p-4"/>
                <div className="mt-6 flex justify-center gap-4">
                     <Button onClick={() => setSelectedIdea(null)} variant="secondary">Retour</Button>
                     <Button>Envoyer</Button>
                </div>
            </div>
        );
    }

    // STEP 2: Idea selection view
    if (analysis) {
        return (
            <div className="max-w-4xl mx-auto py-8 text-center">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">J'ai lu vos notes.</h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10">
                    Il semble que vous explorez plusieurs pistes. Laquelle voulez-vous approfondir en premier ?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysis.extractedIdeas.map((idea, index) => (
                        <div 
                            key={index}
                            onClick={() => setSelectedIdea(idea)}
                            className="p-6 bg-muted rounded-lg text-left cursor-pointer hover:bg-muted/80 transition-colors border border-transparent hover:border-primary"
                        >
                            <h3 className="font-bold text-xl mb-2">{idea.title}</h3>
                            <p className="text-muted-foreground text-sm">
                                <span className="font-semibold">Question de départ :</span> {idea.startingQuestion}
                            </p>
                        </div>
                    ))}
                </div>
                <Button onClick={handleReset} variant="ghost" className="mt-12">
                    Recommencer avec de nouvelles idées
                </Button>
            </div>
        );
    }

    // STEP 1: Initial brain dump view
    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Bonjour.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10">
                Sur quoi réfléchissez-vous aujourd'hui ?
            </p>

            <div className="w-full">
                <Textarea
                    value={brainDump}
                    onChange={(e) => setBrainDump(e.target.value)}
                    placeholder="Videz votre esprit. Listez vos idées, vos doutes, vos objectifs... Ne vous censurez pas, écrivez tout ce qui vous passe par la tête."
                    className="min-h-[200px] text-lg p-6"
                    disabled={isLoading}
                />
            </div>

            <div className="mt-8">
                <Button 
                    onClick={handleStartAnalysis} 
                    disabled={!brainDump.trim() || isLoading}
                    size="lg"
                    className="text-lg px-8 py-6"
                >
                    {isLoading ? (
                        <>
                            <Spinner className="mr-2" />
                            Analyse en cours...
                        </>
                    ) : 'Clarifier mes pensées'}
                </Button>
            </div>
        </div>
    );
};

export default SessionPage;
