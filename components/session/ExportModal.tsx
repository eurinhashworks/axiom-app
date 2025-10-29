import React, { useRef, useState } from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ExportModalProps {
    idea: Idea;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ idea, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copier dans le Presse-papiers');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const generateMarkdown = () => {
        let markdown = `# ${idea.title}\n\n`;
        markdown += `**Statut:** ${idea.status}\n`;
        markdown += `**Score d'Opportunité:** ${idea.opportunityScore?.toFixed(1) || 'N/A'}/10\n`;
        markdown += `**Score de Faisabilité:** ${idea.feasibilityScore?.toFixed(1) || 'N/A'}/10\n\n`;

        if (idea.analysis) {
            markdown += `## Analyse\n\n`;
            markdown += `### Résumé\n${idea.analysis.summary}\n\n`;
            markdown += `### Questions de Clarification\n`;
            idea.analysis.clarifyingQuestions.forEach(q => markdown += `- ${q}\n`);
            markdown += `\n`;
            markdown += `### Risques Potentiels\n`;
            idea.analysis.potentialRisks.forEach(r => markdown += `- ${r}\n`);
            markdown += `\n`;
        }

        if (idea.evaluation) {
            markdown += `## Évaluation Détaillée\n\n`;
            markdown += `- **Urgence du Problème:** ${idea.evaluation.problemUrgency}/10\n`;
            markdown += `- **Taille du Marché Cible:** ${idea.evaluation.targetMarketSize}/10\n`;
            markdown += `- **Avantage Concurrentiel:** ${idea.evaluation.competitiveAdvantage}/10\n`;
            markdown += `- **Alignement Personnel:** ${idea.evaluation.personalAlignment}/10\n`;
            markdown += `- **Faisabilité Technique:** ${idea.evaluation.technicalFeasibility}/10\n\n`;
        }

        if (idea.roadmapSteps) {
            markdown += `## Feuille de Route\n\n`;
            idea.roadmapSteps.forEach(step => {
                markdown += `- [${step.completed ? 'x' : ' '}] ${step.text}\n`;
            });
        }

        return markdown;
    };
    
    const handleCopy = () => {
        if (textAreaRef.current) {
            navigator.clipboard.writeText(textAreaRef.current.value).then(() => {
                setCopyButtonText('Copié !');
                setTimeout(() => setCopyButtonText('Copier dans le Presse-papiers'), 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                setCopyButtonText('Échec de la copie');
            });
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <Card 
                className="w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold">Exporter l'Idée</h2>
                    <Button onClick={onClose} variant="secondary">Fermer</Button>
                </div>
                <textarea
                    ref={textAreaRef}
                    readOnly
                    className="w-full flex-grow p-4 bg-muted rounded-md border border-border resize-none font-mono text-sm"
                    value={generateMarkdown()}
                />
                <div className="mt-4 flex-shrink-0">
                    <Button onClick={handleCopy} className="w-full">{copyButtonText}</Button>
                </div>
            </Card>
        </div>
    );
};

export default ExportModal;