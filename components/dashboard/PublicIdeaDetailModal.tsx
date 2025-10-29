import React from 'react';
import { Idea } from '../../types';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import CommentsSection from './CommentsSection';
import LikeButton from './LikeButton';

interface PublicIdeaDetailModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
}

const PublicIdeaDetailModal: React.FC<PublicIdeaDetailModalProps> = ({ idea, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={idea.title} size="large">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Auteur */}
        {idea.authorName && (
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            {idea.authorPhotoURL && (
              <img
                src={idea.authorPhotoURL}
                alt={idea.authorName}
                className="w-8 h-8 rounded-full border border-border"
              />
            )}
            <div>
              <p className="text-sm font-medium">{idea.authorName}</p>
              <p className="text-xs text-muted-foreground">Auteur de l'idée</p>
            </div>
          </div>
        )}

        {/* Résumé */}
        {idea.analysis?.summary && (
          <Card className="p-3">
            <h3 className="text-sm font-semibold mb-2">Résumé</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{idea.analysis.summary}</p>
          </Card>
        )}

        {/* Scores */}
        {(idea.opportunityScore || idea.feasibilityScore) && (
          <div className="grid grid-cols-2 gap-3">
            {idea.opportunityScore && (
              <Card className="p-3">
                <h4 className="text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400">Opportunité</h4>
                <p className="text-xl font-bold">{idea.opportunityScore.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
              </Card>
            )}
            {idea.feasibilityScore && (
              <Card className="p-3">
                <h4 className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">Faisabilité</h4>
                <p className="text-xl font-bold">{idea.feasibilityScore.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
              </Card>
            )}
          </div>
        )}

        {/* Questions de clarification */}
        {idea.analysis?.clarifyingQuestions && idea.analysis.clarifyingQuestions.length > 0 && (
          <Card className="p-3">
            <h3 className="text-sm font-semibold mb-2">Questions de Clarification</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
              {idea.analysis.clarifyingQuestions.slice(0, 3).map((q, i) => (
                <li key={i} className="leading-relaxed">{q}</li>
              ))}
              {idea.analysis.clarifyingQuestions.length > 3 && (
                <li className="italic">+{idea.analysis.clarifyingQuestions.length - 3} autres questions...</li>
              )}
            </ul>
          </Card>
        )}

        {/* Risques potentiels */}
        {idea.analysis?.potentialRisks && idea.analysis.potentialRisks.length > 0 && (
          <Card className="p-3">
            <h3 className="text-sm font-semibold mb-2">Risques Potentiels</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
              {idea.analysis.potentialRisks.slice(0, 3).map((r, i) => (
                <li key={i} className="leading-relaxed">{r}</li>
              ))}
              {idea.analysis.potentialRisks.length > 3 && (
                <li className="italic">+{idea.analysis.potentialRisks.length - 3} autres risques...</li>
              )}
            </ul>
          </Card>
        )}

        {/* Likes et actions */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <LikeButton ideaId={idea.id} size="md" />
            <div className="text-xs text-muted-foreground">
              Partagez cette idée ou ajoutez vos commentaires
            </div>
          </div>
        </div>

        {/* Section commentaires */}
        <CommentsSection ideaId={idea.id} />

        <div className="pt-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Seul le résumé et les scores sont visibles publiquement. Le brain dump reste privé.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PublicIdeaDetailModal;
