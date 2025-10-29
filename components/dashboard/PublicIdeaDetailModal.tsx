import React from 'react';
import { Idea } from '../../types';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import CommentsSection from './CommentsSection';

interface PublicIdeaDetailModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
}

const PublicIdeaDetailModal: React.FC<PublicIdeaDetailModalProps> = ({ idea, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={idea.title} className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Auteur */}
        {idea.authorName && (
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            {idea.authorPhotoURL && (
              <img
                src={idea.authorPhotoURL}
                alt={idea.authorName}
                className="w-10 h-10 rounded-full border-2 border-border"
              />
            )}
            <div>
              <p className="font-medium">{idea.authorName}</p>
              <p className="text-sm text-muted-foreground">Auteur de l'idée</p>
            </div>
          </div>
        )}

        {/* Résumé */}
        {idea.analysis?.summary && (
          <Card>
            <h3 className="text-lg font-semibold mb-2">Résumé</h3>
            <p className="text-muted-foreground leading-relaxed">{idea.analysis.summary}</p>
          </Card>
        )}

        {/* Scores */}
        {(idea.opportunityScore || idea.feasibilityScore) && (
          <div className="grid md:grid-cols-2 gap-4">
            {idea.opportunityScore && (
              <Card>
                <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Score d'Opportunité</h4>
                <p className="text-3xl font-bold">{idea.opportunityScore.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span></p>
              </Card>
            )}
            {idea.feasibilityScore && (
              <Card>
                <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">Score de Faisabilité</h4>
                <p className="text-3xl font-bold">{idea.feasibilityScore.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span></p>
              </Card>
            )}
          </div>
        )}

        {/* Questions de clarification */}
        {idea.analysis?.clarifyingQuestions && idea.analysis.clarifyingQuestions.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold mb-3">Questions de Clarification</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              {idea.analysis.clarifyingQuestions.map((q, i) => (
                <li key={i} className="leading-relaxed">{q}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Risques potentiels */}
        {idea.analysis?.potentialRisks && idea.analysis.potentialRisks.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold mb-3">Risques Potentiels</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              {idea.analysis.potentialRisks.map((r, i) => (
                <li key={i} className="leading-relaxed">{r}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Section commentaires */}
        <CommentsSection ideaId={idea.id} />

        <div className="pt-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
