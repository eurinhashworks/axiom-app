import React, { useState, useEffect } from 'react';
import { Idea } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';

interface EditIdeaModalProps {
    idea: Idea;
    isOpen: boolean;
    onClose: () => void;
}

const EditIdeaModal: React.FC<EditIdeaModalProps> = ({ idea, isOpen, onClose }) => {
    const { updateIdea } = useIdeas();
    const { showToast } = useToast();
    const [title, setTitle] = useState(idea.title);
    const [brainDump, setBrainDump] = useState(idea.brainDump);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(idea.title);
            setBrainDump(idea.brainDump);
        }
    }, [isOpen, idea]);

    const handleSave = async () => {
        if (!title.trim()) {
            showToast('Le titre ne peut pas être vide', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const updates: Partial<Idea> = { 
                title: title.trim()
            };

            // Si le brain dump a changé, réinitialiser l'analyse
            if (brainDump.trim() !== idea.brainDump.trim()) {
                updates.brainDump = brainDump.trim();
                // Utiliser deleteField() via null pour supprimer les champs (Firestore le gère mieux)
                // Le service cleanFirestoreData omettra ces champs
                updates.status = 'DRAFT';
                // Ne pas inclure analysis, evaluation, etc. - ils seront omis automatiquement
                // et Firestore les supprimera lors du merge si nécessaire
            } else {
                updates.brainDump = brainDump.trim();
            }

            await updateIdea(idea.id, updates);
            showToast('Idée modifiée avec succès', 'success');
            onClose();
        } catch (error) {
            console.error('Error updating idea:', error);
            showToast('Erreur lors de la modification de l\'idée', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = title !== idea.title || brainDump !== idea.brainDump;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'idée">
            <div className="space-y-4">
                <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                        Titre
                    </label>
                    <input
                        id="edit-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                        placeholder="Titre de l'idée"
                        maxLength={100}
                    />
                </div>

                <div>
                    <label htmlFor="edit-brain-dump" className="block text-sm font-medium mb-2">
                        Brain Dump
                        <span className="text-xs text-muted-foreground ml-2">
                            (modifier le brain dump réinitialisera l'analyse)
                        </span>
                    </label>
                    <textarea
                        id="edit-brain-dump"
                        value={brainDump}
                        onChange={(e) => setBrainDump(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-h-[150px] resize-y"
                        placeholder="Décrivez votre idée en détail..."
                    />
                    {brainDump !== idea.brainDump && (
                        <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-md">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                ⚠️ Modifier le brain dump réinitialisera l'analyse, l'évaluation et la roadmap.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={!hasChanges || isSaving || !title.trim()}
                        isLoading={isSaving}
                    >
                        Enregistrer
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditIdeaModal;

