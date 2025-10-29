import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { validateIdeaTitle } from '../../utils/validation';

interface NewIdeaModalProps {
    onClose: () => void;
    onSubmit: (title: string) => void;
}

const NewIdeaModal: React.FC<NewIdeaModalProps> = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const validateTitle = (value: string): boolean => {
        const validation = validateIdeaTitle(value);
        if (!validation.isValid) {
            setError(validation.errors[0] || 'Titre invalide');
            return false;
        }
        setError('');
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTitle(value);
        if (error) {
            validateTitle(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateTitle(title)) {
            onSubmit(title.trim());
            showToast('Idée créée avec succès !', 'success');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Nouvelle Idée">
            <form onSubmit={handleSubmit}>
                <p className="text-muted-foreground mb-4">Donnez un nom court et mémorable à votre idée.</p>
                
                <div className="mb-4">
                    <label htmlFor="idea-title" className="block text-sm font-medium mb-2">
                        Titre de l'idée
                    </label>
                    <input
                        id="idea-title"
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={handleChange}
                        onBlur={() => validateTitle(title)}
                        className={`w-full p-3 border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 transition-all ${
                            error 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-border focus:ring-brand'
                        }`}
                        placeholder="Ex: Une IA pour l'arrosage des plantes"
                        aria-invalid={!!error}
                        aria-describedby={error ? 'error-message' : undefined}
                    />
                    {error && (
                        <p id="error-message" className="mt-2 text-sm text-red-500 animate-fade-in" role="alert">
                            {error}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                        {title.length}/100 caractères
                    </p>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={!title.trim() || !!error}>
                        Créer l'Idée
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default NewIdeaModal;
