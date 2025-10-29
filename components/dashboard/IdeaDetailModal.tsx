import React, { useState } from 'react';
import { Idea } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from './StatusBadge';
import EditIdeaModal from './EditIdeaModal';
import LikeButton from './LikeButton';
import CommentsSection from './CommentsSection';
import ForumButton from '../forum/ForumButton';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface IdeaDetailModalProps {
    idea: Idea;
    isOpen: boolean;
    onClose: () => void;
    onNavigateToSession?: () => void;
}

const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({ 
    idea, 
    isOpen, 
    onClose,
    onNavigateToSession 
}) => {
    const { setActiveIdea, updateIdea } = useIdeas();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isTogglingPublic, setIsTogglingPublic] = useState(false);
    
    const isOwner = user && (idea.userId === user.uid || idea.authorId === user.uid);

    const handleStartSession = () => {
        setActiveIdea(idea);
        if (onNavigateToSession) {
            onNavigateToSession();
        } else {
            window.location.hash = '#session';
        }
        onClose();
    };

    const handleTogglePublic = async () => {
        if (!user || !isOwner) return;

        setIsTogglingPublic(true);
        try {
            const newPublicStatus = !idea.isPublic;
            const updates: Partial<Idea> = {
                isPublic: newPublicStatus
            };

            // Si on publie, ajouter les informations d'auteur
            if (newPublicStatus) {
                updates.authorId = user.uid;
                updates.authorName = user.displayName || 'Utilisateur anonyme';
                updates.authorPhotoURL = user.photoURL || null;
            }

            await updateIdea(idea.id, updates);
            showToast(
                newPublicStatus 
                    ? 'Idée publiée avec succès ! Elle est maintenant visible publiquement.' 
                    : 'Idée retirée de la publication. Elle est maintenant privée.',
                'success'
            );
        } catch (error) {
            console.error('Error toggling public status:', error);
            showToast('Erreur lors de la modification du statut de publication', 'error');
        } finally {
            setIsTogglingPublic(false);
        }
    };

    // La suppression se fait via le bouton dans IdeaCard

    if (isEditing && isOwner) {
        return (
            <EditIdeaModal
                idea={idea}
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
            />
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'idée" size="large">
            <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-border">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold mb-2 break-words">{idea.title}</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={idea.status} />
                            {idea.isPublic && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Publique
                                </span>
                            )}
                            <span className="text-xs sm:text-sm text-muted-foreground">
                                Créée le {new Date(idea.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                    {isOwner && (
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <Button
                                variant={idea.isPublic ? "primary" : "secondary"}
                                onClick={handleTogglePublic}
                                disabled={isTogglingPublic}
                                className="text-sm w-full sm:w-auto transition-all hover:scale-105"
                            >
                                {isTogglingPublic ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {idea.isPublic ? 'Retrait...' : 'Publication...'}
                                    </>
                                ) : (
                                    <>
                                        {idea.isPublic ? (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                                Rendre privée
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Publier
                                            </>
                                        )}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditing(true)}
                                className="text-sm w-full sm:w-auto transition-all hover:scale-105"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                            </Button>
                        </div>
                    )}
                </div>

                {/* Scores */}
                {(idea.opportunityScore !== undefined || idea.feasibilityScore !== undefined) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-3 bg-muted/50 rounded-lg">
                        {idea.opportunityScore !== undefined && (
                            <div>
                                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Score d'Opportunité</div>
                                <div className="text-lg sm:text-xl font-bold text-brand">{idea.opportunityScore.toFixed(1)}/10</div>
                                <div className="w-full bg-background rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-brand h-2 rounded-full transition-all"
                                        style={{ width: `${(idea.opportunityScore / 10) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        {idea.feasibilityScore !== undefined && (
                            <div>
                                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Score de Faisabilité</div>
                                <div className="text-lg sm:text-xl font-bold text-brand">{idea.feasibilityScore.toFixed(1)}/10</div>
                                <div className="w-full bg-background rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-brand h-2 rounded-full transition-all"
                                        style={{ width: `${(idea.feasibilityScore / 10) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Résumé de l'analyse */}
                {idea.analysis?.summary && (
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-2">Résumé de l'analyse</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-4">{idea.analysis.summary}</p>
                    </div>
                )}

                {/* Brain Dump */}
                {idea.brainDump && (
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-2">Brain Dump</h3>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                            <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-6">
                                {idea.brainDump}
                            </p>
                        </div>
                    </div>
                )}

                {/* Questions de clarification */}
                {idea.analysis?.clarifyingQuestions && idea.analysis.clarifyingQuestions.length > 0 && (
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-2">Questions de clarification</h3>
                        <ul className="space-y-1">
                            {idea.analysis.clarifyingQuestions.slice(0, 3).map((question, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="text-brand font-bold text-xs">•</span>
                                    <span className="text-xs sm:text-sm text-muted-foreground flex-1">{question}</span>
                                </li>
                            ))}
                            {idea.analysis.clarifyingQuestions.length > 3 && (
                                <li className="text-xs text-muted-foreground italic">
                                    +{idea.analysis.clarifyingQuestions.length - 3} autres questions...
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Risques potentiels */}
                {idea.analysis?.potentialRisks && idea.analysis.potentialRisks.length > 0 && (
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-2">Risques potentiels</h3>
                        <ul className="space-y-1">
                            {idea.analysis.potentialRisks.slice(0, 3).map((risk, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="text-destructive font-bold text-xs">⚠</span>
                                    <span className="text-xs sm:text-sm text-muted-foreground flex-1">{risk}</span>
                                </li>
                            ))}
                            {idea.analysis.potentialRisks.length > 3 && (
                                <li className="text-xs text-muted-foreground italic">
                                    +{idea.analysis.potentialRisks.length - 3} autres risques...
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Évaluation détaillée */}
                {idea.evaluation && (
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-2">Évaluation détaillée</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground">Urgence</div>
                                <div className="text-lg font-bold">{idea.evaluation.problemUrgency}/10</div>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground">Marché</div>
                                <div className="text-lg font-bold">{idea.evaluation.targetMarketSize}/10</div>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground">Avantage</div>
                                <div className="text-lg font-bold">{idea.evaluation.competitiveAdvantage}/10</div>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground">Alignement</div>
                                <div className="text-lg font-bold">{idea.evaluation.personalAlignment}/10</div>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg col-span-2">
                                <div className="text-xs text-muted-foreground">Faisabilité technique</div>
                                <div className="text-lg font-bold">{idea.evaluation.technicalFeasibility}/10</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Roadmap */}
                {idea.roadmapSteps && idea.roadmapSteps.length > 0 && (
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-2">Feuille de route</h3>
                        <ol className="space-y-1">
                            {idea.roadmapSteps.slice(0, 5).map((step, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <span className={`text-xs sm:text-sm text-muted-foreground flex-1 ${step.completed ? 'line-through opacity-60' : ''}`}>
                                        {step.text}
                                    </span>
                                    {step.completed && (
                                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                                    )}
                                </li>
                            ))}
                            {idea.roadmapSteps.length > 5 && (
                                <li className="text-xs text-muted-foreground italic ml-7">
                                    +{idea.roadmapSteps.length - 5} autres étapes...
                                </li>
                            )}
                        </ol>
                    </div>
                )}

                {/* Likes et Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-4">
                        <LikeButton ideaId={idea.id} size="lg" />
                        {idea.isPublic && (
                            <div className="text-sm text-muted-foreground">
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Idée publique
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>
                            Fermer
                        </Button>
                        {isOwner && (
                            <Button
                                onClick={handleStartSession}
                                className="transition-all hover:scale-105"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Ouvrir dans Session
                            </Button>
                        )}
                    </div>
                </div>

                {/* Section commentaires pour les idées publiques */}
                {idea.isPublic && (
                    <div className="pt-4 border-t border-border">
                        <CommentsSection ideaId={idea.id} />
                    </div>
                )}

                {/* Bouton Forum */}
                <div className="pt-4 border-t border-border">
                    <ForumButton idea={idea} className="w-full" />
                </div>
            </div>
        </Modal>
    );
};

export default IdeaDetailModal;

