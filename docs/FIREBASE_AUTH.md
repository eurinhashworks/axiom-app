# Configuration de l'Authentification Google Firebase

## Étapes de configuration dans Firebase Console

### 1. Activer Google Authentication

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Authentication** dans le menu de gauche
4. Cliquez sur **Get Started** si c'est la première fois
5. Allez dans l'onglet **Sign-in method**
6. Cliquez sur **Google** dans la liste des providers
7. **Activez** Google et configurez :
   - **Support email** : Votre email de support
   - **Project support email** : L'email du projet
8. Cliquez sur **Save**

### 2. Configurer les domaines autorisés

Dans **Authentication > Settings > Authorized domains** :
- Vérifiez que `localhost` est présent (pour le développement)
- Ajoutez votre domaine de production si nécessaire

### 3. Variables d'environnement

Assurez-vous que votre fichier `.env` contient toutes les variables Firebase :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Règles de sécurité Firestore

Dans **Firestore Database > Rules**, assurez-vous d'avoir des règles de sécurité :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les idées
    match /ideas/{ideaId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Règles pour les profils utilisateurs
    match /userProfiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les autres collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Fonctionnalités implémentées

✅ **Connexion Google** : Popup de connexion Google OAuth  
✅ **Gestion de session** : Session persistante avec Firebase Auth  
✅ **Profil utilisateur** : Création automatique du profil dans Firestore  
✅ **Protection des routes** : Redirection vers Login si non authentifié  
✅ **Menu utilisateur** : Affichage photo, nom, email et bouton déconnexion  
✅ **États de chargement** : Gestion du loading pendant l'authentification  
✅ **Gestion des erreurs** : Notifications toast pour les erreurs  

## Utilisation

### Dans un composant

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, loading, signInWithGoogle, logout, isAuthenticated } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <button onClick={signInWithGoogle}>Se connecter</button>;
  
  return <div>Bienvenue {user?.displayName}!</div>;
};
```

## Prochaines étapes

- [ ] Synchroniser les idées avec Firebase (au lieu de localStorage)
- [ ] Ajouter système de permissions (public/privé)
- [ ] Implémenter le partage d'idées
- [ ] Ajouter système de collaboration

