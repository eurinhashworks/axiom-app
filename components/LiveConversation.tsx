import React from 'react';
import useLiveSession from '../hooks/useLiveSession';
import Button from './ui/Button';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

interface LiveConversationProps {
  onSubmit: (transcript: string) => void;
  isLoading?: boolean;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ onSubmit, isLoading = false }) => {
    const { isSessionActive, transcription, error, startSession, stopSession } = useLiveSession();

    const handleEndConversation = () => {
        stopSession();
        if (transcription) {
            onSubmit(transcription);
        }
    };
    
    return (
        <Card className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-4">
                <h2 className="text-xl font-semibold">Session de Brainstorming en Direct</h2>
                <p className="text-muted-foreground">
                    {isSessionActive ? "Exprimez-vous. Nous capturons vos pensées." : "Cliquez sur Démarrer pour commencer une conversation vocale."}
                </p>
            </div>
            
            <div className="min-h-[200px] bg-muted rounded-md p-4 mb-4 border border-border">
                {isSessionActive && !transcription && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{transcription}</pre>
            </div>

            {error && <p className="text-destructive text-center my-2">{error}</p>}

            <div className="flex justify-center space-x-4">
                {!isSessionActive ? (
                    <Button onClick={startSession} disabled={isLoading}>Démarrer la session</Button>
                ) : (
                    <Button onClick={handleEndConversation} variant="destructive" disabled={isLoading}>
                        {isLoading ? 'Analyse en cours...' : 'Terminer & Analyser'}
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default LiveConversation;
