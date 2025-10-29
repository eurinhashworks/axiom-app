import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface InputSelectionProps {
    onSelect: (method: 'text' | 'voice') => void;
}

const InputSelection: React.FC<InputSelectionProps> = ({ onSelect }) => {
    return (
        <Card className="text-center max-w-lg mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Démarrer une Nouvelle Session d'Idée</h2>
            <p className="mb-6 text-muted-foreground">Comment souhaitez-vous capturer votre idée ?</p>
            <div className="flex justify-center space-x-4">
                <Button onClick={() => onSelect('text')}>Commencer avec du Texte</Button>
                <Button onClick={() => onSelect('voice')} variant="secondary">Commencer avec la Voix</Button>
            </div>
        </Card>
    );
};

export default InputSelection;
