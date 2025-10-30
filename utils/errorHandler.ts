// Gestionnaire d'erreurs centralisé pour Firebase et API
import { FirebaseError } from 'firebase/app';

export interface ErrorMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export const handleFirebaseError = (error: unknown): ErrorMessage => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return {
          title: 'Permission refusée',
          message: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
          type: 'error'
        };
      case 'unavailable':
        return {
          title: 'Service indisponible',
          message: 'Le service est temporairement indisponible. Veuillez réessayer plus tard.',
          type: 'warning'
        };
      case 'unauthenticated':
        return {
          title: 'Non authentifié',
          message: 'Vous devez être connecté pour effectuer cette action.',
          type: 'error'
        };
      case 'not-found':
        return {
          title: 'Ressource introuvable',
          message: 'La ressource que vous recherchez n\'existe pas ou a été supprimée.',
          type: 'error'
        };
      case 'already-exists':
        return {
          title: 'Déjà existant',
          message: 'Cette ressource existe déjà.',
          type: 'warning'
        };
      case 'failed-precondition':
        return {
          title: 'Condition non remplie',
          message: 'Une condition requise n\'est pas remplie. Vérifiez vos données.',
          type: 'error'
        };
      case 'resource-exhausted':
        return {
          title: 'Quota dépassé',
          message: 'Vous avez atteint la limite d\'utilisation. Veuillez réessayer plus tard.',
          type: 'warning'
        };
      default:
        return {
          title: 'Erreur Firebase',
          message: error.message || 'Une erreur est survenue lors de l\'opération.',
          type: 'error'
        };
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Erreur',
      message: error.message || 'Une erreur inattendue est survenue.',
      type: 'error'
    };
  }

  return {
    title: 'Erreur inconnue',
    message: 'Une erreur inattendue est survenue. Veuillez réessayer.',
    type: 'error'
  };
};

export const handleAPIError = (error: unknown): ErrorMessage => {
  if (error instanceof Error) {
    // Erreurs spécifiques à l'API Gemini
    if (error.message.includes('API key')) {
      return {
        title: 'Clé API invalide',
        message: 'La clé API Gemini n\'est pas valide ou est manquante.',
        type: 'error'
      };
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return {
        title: 'Quota dépassé',
        message: 'Vous avez atteint la limite d\'utilisation de l\'API. Veuillez réessayer plus tard.',
        type: 'warning'
      };
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Erreur réseau',
        message: 'Problème de connexion. Vérifiez votre connexion internet.',
        type: 'warning'
      };
    }
    
    return {
      title: 'Erreur API',
      message: error.message || 'Une erreur est survenue lors de l\'appel à l\'API.',
      type: 'error'
    };
  }

  return {
    title: 'Erreur inconnue',
    message: 'Une erreur inattendue est survenue. Veuillez réessayer.',
    type: 'error'
  };
};

export const logError = (error: unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${context || 'Error'}]`, {
    message: errorMessage,
    stack: errorStack,
    error
  });
  
  // Ici vous pourriez envoyer l'erreur à un service de monitoring comme Sentry
  // Sentry.captureException(error, { contexts: { context } });
};


