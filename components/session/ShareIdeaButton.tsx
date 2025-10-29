import React, { useState } from 'react';
import { Idea } from '../../types';
import { useIdeas } from '../../contexts/IdeasContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface ShareIdeaButtonProps {
  idea: Idea;
}

const ShareIdeaButton: React.FC<ShareIdeaButtonProps> = ({ idea }) => {
  const { updateIdea } = useIdeas();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleTogglePublic = async () => {
    setIsUpdating(true);
    try {
      await updateIdea(idea.id, { isPublic: !idea.isPublic });
      showToast(
        idea.isPublic 
          ? 'Idée rendue privée' 
          : 'Idée partagée publiquement ! Elle est maintenant visible par tous.',
        idea.isPublic ? 'info' : 'success'
      );
      setIsOpen(false);
    } catch (error) {
      console.error('Error toggling public status:', error);
      showToast('Erreur lors de la modification du partage', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/#explore?idea=${idea.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      showToast('Lien copié dans le presse-papiers !', 'success');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      showToast('Erreur lors de la copie du lien', 'error');
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="text-sm"
      >
        {idea.isPublic ? (
          <>
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            Publique
          </>
        ) : (
          <>
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager
          </>
        )}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={idea.isPublic ? 'Rendre l\'idée privée' : 'Partager cette idée'}>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {idea.isPublic ? (
              <>Cette idée est actuellement <strong>publique</strong> et visible par tous les utilisateurs d'AXIOM.</>
            ) : (
              <>En rendant cette idée <strong>publique</strong>, elle sera visible par tous les utilisateurs de la plateforme et pourra être explorée dans la section "Explorer".</>
            )}
          </p>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Seulement le résumé et les scores sont visibles</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Le brain dump reste privé</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Vous pouvez rendre l'idée privée à tout moment</span>
            </div>
          </div>

          {idea.isPublic && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Lien de partage</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/#explore?idea=${idea.id}`}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-muted text-foreground text-sm"
                />
                <Button
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copié !
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copier
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isUpdating}>
              Annuler
            </Button>
            <Button 
              onClick={handleTogglePublic} 
              isLoading={isUpdating}
              variant={idea.isPublic ? 'destructive' : 'primary'}
            >
              {idea.isPublic ? 'Rendre privée' : 'Rendre publique'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShareIdeaButton;

