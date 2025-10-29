import React, { useState } from 'react';
import { Idea } from '../../types';
import Button from '../ui/Button';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../ui/ConfirmModal';

interface QuickActionsProps {
    selectedIdeas: Idea[];
    onIdeasChange: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ selectedIdeas, onIdeasChange }) => {
    const { updateIdea, deleteIdea } = useIdeas();
    const { showToast } = useToast();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

    if (selectedIdeas.length === 0) return null;

    const handleDuplicate = async (idea: Idea) => {
        try {
            const duplicatedIdea = {
                ...idea,
                id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: `${idea.title} (Copie)`,
                createdAt: Date.now(),
                status: 'DRAFT' as const,
                opportunityScore: undefined,
                feasibilityScore: undefined,
                analysis: undefined,
                evaluation: undefined,
                roadmapSteps: undefined,
                clarifyingAnswers: undefined
            };
            
            await updateIdea(duplicatedIdea.id, duplicatedIdea);
            showToast('Idée dupliquée avec succès', 'success');
            onIdeasChange();
        } catch (error) {
            console.error('Error duplicating idea:', error);
            showToast('Erreur lors de la duplication', 'error');
        }
    };

    const handleToggleFavorite = async (idea: Idea) => {
        try {
            await updateIdea(idea.id, { 
                isFavorite: !idea.isFavorite 
            });
            showToast(
                idea.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris', 
                'success'
            );
            onIdeasChange();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('Erreur lors de la modification', 'error');
        }
    };

    const handleArchive = async () => {
        try {
            const promises = selectedIdeas.map(idea => 
                updateIdea(idea.id, { isArchived: true })
            );
            await Promise.all(promises);
            showToast(`${selectedIdeas.length} idée(s) archivée(s)`, 'success');
            onIdeasChange();
            setShowArchiveConfirm(false);
        } catch (error) {
            console.error('Error archiving ideas:', error);
            showToast('Erreur lors de l\'archivage', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            const promises = selectedIdeas.map(idea => deleteIdea(idea.id));
            await Promise.all(promises);
            showToast(`${selectedIdeas.length} idée(s) supprimée(s)`, 'success');
            onIdeasChange();
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Error deleting ideas:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const handleBulkDuplicate = async () => {
        try {
            const promises = selectedIdeas.map(idea => handleDuplicate(idea));
            await Promise.all(promises);
            showToast(`${selectedIdeas.length} idée(s) dupliquée(s)`, 'success');
        } catch (error) {
            console.error('Error bulk duplicating ideas:', error);
            showToast('Erreur lors de la duplication', 'error');
        }
    };

    const handleBulkToggleFavorite = async () => {
        try {
            const promises = selectedIdeas.map(idea => handleToggleFavorite(idea));
            await Promise.all(promises);
            showToast(`${selectedIdeas.length} idée(s) modifiée(s)`, 'success');
        } catch (error) {
            console.error('Error bulk toggling favorite:', error);
            showToast('Erreur lors de la modification', 'error');
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                    {selectedIdeas.length} idée(s) sélectionnée(s)
                </span>
            </div>

            <div className="flex flex-wrap gap-1 sm:ml-auto w-full sm:w-auto">
                <Button
                    variant="secondary"
                    onClick={handleBulkDuplicate}
                    className="text-xs px-2 py-1"
                >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Dupliquer
                </Button>

                <Button
                    variant="secondary"
                    size="small"
                    onClick={handleBulkToggleFavorite}
                    className="text-xs"
                >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Favoris
                </Button>

                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setShowArchiveConfirm(true)}
                    className="text-xs"
                >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
                    </svg>
                    Archiver
                </Button>

                <Button
                    variant="destructive"
                    size="small"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs"
                >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                </Button>
            </div>

            {showArchiveConfirm && (
                <ConfirmModal
                    isOpen={showArchiveConfirm}
                    onClose={() => setShowArchiveConfirm(false)}
                    onConfirm={handleArchive}
                    title="Archiver les idées"
                    message={`Êtes-vous sûr de vouloir archiver ${selectedIdeas.length} idée(s) ? Elles seront masquées du tableau de bord principal.`}
                    confirmText="Archiver"
                    cancelText="Annuler"
                />
            )}

            {showDeleteConfirm && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    title="Supprimer les idées"
                    message={`Êtes-vous sûr de vouloir supprimer définitivement ${selectedIdeas.length} idée(s) ? Cette action est irréversible.`}
                    confirmText="Supprimer"
                    cancelText="Annuler"
                    variant="destructive"
                />
            )}
        </div>
    );
};

export default QuickActions;
