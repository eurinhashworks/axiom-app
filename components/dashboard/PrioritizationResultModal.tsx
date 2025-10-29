import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
    const createMarkup = () => {
        let html = content
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc">$1</li>')
            .replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc">$1</li>')
            .replace(/\n/g, '<br />');
        
        // This is a simplified approach; adjacent list items won't be in a <ul>
        // and paragraphs are not explicitly wrapped in <p> tags.
        // For a full solution, a library like react-markdown is recommended.
        return { __html: html };
    };

    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={createMarkup()} />;
};


interface PrioritizationResultModalProps {
    result: string;
    onClose: () => void;
}

const PrioritizationResultModal: React.FC<PrioritizationResultModalProps> = ({ result, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <Card 
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Analyse de Priorisation</h2>
                    <Button onClick={onClose} variant="secondary">Fermer</Button>
                </div>
                <div className="p-4 bg-muted rounded-md border border-border">
                    <SimpleMarkdown content={result} />
                </div>
            </Card>
        </div>
    );
};

export default PrioritizationResultModal;