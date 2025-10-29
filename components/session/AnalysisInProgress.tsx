import React from 'react';
import Card from '../ui/Card';

const AnalysisInProgress: React.FC = () => {
  const messages = [
    "Analyse de votre 'brain dump'...",
    "Identification des thèmes clés...",
    "Extraction des concepts principaux...",
    "Formulation de questions pertinentes...",
    "Évaluation des risques potentiels...",
    "Synthèse des informations..."
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="text-center max-w-lg mx-auto animate-fade-in">
      <div className="flex flex-col items-center justify-center h-48">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Analyse en Cours</h2>
        <p className="text-muted-foreground transition-opacity duration-500">{message}</p>
      </div>
    </Card>
  );
};

export default AnalysisInProgress;
