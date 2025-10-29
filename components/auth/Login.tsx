import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      showToast('Connexion réussie ! Bienvenue sur AXIOM', 'success');
    } catch (error: any) {
      // Ne pas afficher de message d'erreur si l'utilisateur a simplement fermé la popup
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // L'utilisateur a volontairement annulé, pas besoin de notification
        return;
      }
      
      // Pour les autres erreurs, afficher un message approprié
      console.error('Error signing in:', error);
      let errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'La popup a été bloquée. Veuillez autoriser les popups pour ce site.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domaine non autorisé. Contactez le support.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent">
              AXIOM
            </h1>
            <p className="text-muted-foreground">
              Suite de Clarté Stratégique IA
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour accéder à votre espace personnel et commencer à transformer vos idées en opportunités stratégiques.
            </p>

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full flex items-center justify-center gap-3"
            >
              {!isLoading && (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuer avec Google
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
