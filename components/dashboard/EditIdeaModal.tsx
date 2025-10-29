import React, { useState, useEffect } from 'react';
import { Idea } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface EditIdeaModalProps {
    idea: Idea;
    isOpen: boolean;
    onClose: () => void;
}

const EditIdeaModal: React.FC<EditIdeaModalProps> = ({ idea, isOpen, onClose }) => {
    const { updateIdea } = useIdeas();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [title, setTitle] = useState(idea.title);
    const [brainDump, setBrainDump] = useState(idea.brainDump);
    const [isPublic, setIsPublic] = useState(idea.isPublic || false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(idea.title);
            setBrainDump(idea.brainDump);
            setIsPublic(idea.isPublic || false);
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
                title: title.trim(),
                isPublic: isPublic
            };

            // Si on publie, ajouter les informations d'auteur
            if (isPublic && user) {
                updates.authorId = user.uid;
                updates.authorName = user.displayName || 'Utilisateur anonyme';
                updates.authorPhotoURL = user.photoURL || null;
            }

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
            showToast(
                isPublic !== idea.isPublic
                    ? isPublic
                        ? 'Idée publiée et modifiée avec succès !' 
                        : 'Idée retirée de la publication et modifiée avec succès.'
                    : 'Idée modifiée avec succès',
                'success'
            );
            onClose();
        } catch (error) {
            console.error('Error updating idea:', error);
            showToast('Erreur lors de la modification de l\'idée', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = title !== idea.title || brainDump !== idea.brainDump || isPublic !== (idea.isPublic || false);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'idée">
            <div className="space-y-4">
                <div>
                    <label htmlFor="edit-title" className="block text-xs sm:text-sm font-medium mb-2">
                        Titre
                    </label>
                    <input
                        id="edit-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm sm:text-base"
                        placeholder="Titre de l'idée"
                        maxLength={100}
                    />
                </div>

                <div>
                    <label htmlFor="edit-brain-dump" className="block text-xs sm:text-sm font-medium mb-2">
                        Brain Dump
                        <span className="text-xs text-muted-foreground ml-1 sm:ml-2 block sm:inline">
                            (modifier le brain dump réinitialisera l'analyse)
                        </span>
                    </label>
                    <textarea
                        id="edit-brain-dump"
                        value={brainDump}
                        onChange={(e) => setBrainDump(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-h-[120px] sm:min-h-[150px] resize-y text-sm sm:text-base"
                        placeholder="Décrivez votre idée en détail..."
                    />
                    {brainDump !== idea.brainDump && (
                        <div className="mt-2 p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-md">
                            <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                                ⚠️ Modifier le brain dump réinitialisera l'analyse, l'évaluation et la roadmap.
                            </p>
                        </div>
                    )}
                </div>

                {/* Toggle public/privé */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex-1">
                        <label htmlFor="edit-public" className="block text-xs sm:text-sm font-medium mb-1">
                            Visibilité
                        </label>
                        <p className="text-xs text-muted-foreground">
                            {isPublic 
                                ? 'Cette idée est visible publiquement et peut être explorée par d\'autres utilisateurs.'
                                : 'Cette idée est privée et visible uniquement par vous.'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                            type="checkbox"
                            id="edit-public"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 dark:peer-focus:ring-brand/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand"></div>
                    </label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto">
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={!hasChanges || isSaving || !title.trim()}
                        isLoading={isSaving}
                        className="w-full sm:w-auto"
                    >
                        Enregistrer
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditIdeaModal;

