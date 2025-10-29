# Règles de Sécurité Firestore pour le Partage

## Configuration des Règles

Les règles Firestore sont définies dans le fichier `firestore.rules` à la racine du projet.

### Déploiement des Règles

**Option 1 : Via Firebase Console (Recommandé)**

1. Allez dans **Firebase Console > Firestore Database > Rules**
2. Copiez le contenu du fichier `firestore.rules`
3. Collez-le dans l'éditeur de règles
4. Cliquez sur **Publish**

**Option 2 : Via Firebase CLI**

Si vous utilisez Firebase CLI :
```bash
firebase deploy --only firestore:rules
```

### Contenu des Règles

Les règles complètes sont dans `firestore.rules`. Voici un résumé :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function pour vérifier l'authentification
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function pour vérifier si l'utilisateur est le propriétaire
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Collection des idées
    match /ideas/{ideaId} {
      // Lecture : propriétaire ou idée publique
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        resource.data.isPublic == true
      );
      
      // Création : seulement utilisateur authentifié
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Modification : seulement le propriétaire
      allow update: if isOwner(resource.data.userId) &&
        request.resource.data.userId == resource.data.userId;
      
      // Suppression : seulement le propriétaire
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Collection des profils utilisateurs
    match /userProfiles/{userId} {
      // Lecture : tous les utilisateurs authentifiés
      allow read: if isAuthenticated();
      
      // Création : l'utilisateur peut créer son propre profil
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        userId == request.auth.uid;
      
      // Mise à jour : seulement le propriétaire
      allow update: if isAuthenticated() && 
        userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid &&
        resource.data.userId == request.auth.uid;
      
      // Suppression : seulement le propriétaire
      allow delete: if isOwner(userId);
    }
    
    // Collection des commentaires
    match /comments/{commentId} {
      // Lecture : tous les utilisateurs authentifiés
      allow read: if isAuthenticated();
      
      // Création : utilisateur authentifié peut créer un commentaire
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Mise à jour : seulement l'auteur du commentaire
      allow update: if isOwner(resource.data.userId) &&
        request.resource.data.userId == resource.data.userId;
      
      // Suppression : seulement l'auteur du commentaire
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Collection des analyses de marché
    match /marketAnalysis/{analysisId} {
      allow read, write: if isAuthenticated();
    }
    
    // Collection des feedbacks
    match /feedback/{feedbackId} {
      allow read, write: if isAuthenticated();
    }
    
    // Collection des résultats de scoring
    match /scoringResults/{resultId} {
      allow read, write: if isAuthenticated();
    }
    
    // Collection des données d'entraînement
    match /trainingData/{trainingId} {
      allow read, write: if isAuthenticated();
    }
    
    // Collection des résultats d'idées
    match /ideaOutcomes/{outcomeId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

## Explication des Règles

### Idées (ideas)
- **Lecture** : Propriétaire OU idée publique (`isPublic == true`)
- **Création** : Utilisateur authentifié (doit être propriétaire)
- **Modification** : Seulement le propriétaire
- **Suppression** : Seulement le propriétaire

### Profils Utilisateurs (userProfiles)
- **Lecture** : Tous les utilisateurs authentifiés (pour afficher les noms/auteurs)
- **Création** : L'utilisateur peut créer son propre profil (userId doit correspondre)
- **Mise à jour** : Seulement le propriétaire
- **Suppression** : Seulement le propriétaire

### Commentaires (comments)
- **Lecture** : Tous les utilisateurs authentifiés
- **Création** : Utilisateur authentifié peut créer un commentaire
- **Mise à jour** : Seulement l'auteur du commentaire
- **Suppression** : Seulement l'auteur du commentaire

## Index Composites Requis

Firestore nécessite des index composites quand on combine `where()` avec `orderBy()` sur des champs différents.

### Index 1 : Idées par utilisateur (OBLIGATOIRE)

Pour les requêtes `where('userId', '==', userId)` avec `orderBy('createdAt', 'desc')` :

**Création rapide :**
- Cliquez sur le lien dans l'erreur de la console du navigateur
- Ou créez manuellement :

1. Allez dans **Firebase Console > Firestore Database > Indexes**
2. Cliquez sur **Create Index**
3. Configurez :
   - **Collection ID** : `ideas`
   - **Fields to index** :
     - `userId` : Ascending
     - `createdAt` : Descending
   - **Query scope** : Collection
4. Cliquez sur **Create**

**⚠️ Important :** L'index peut prendre quelques minutes à être créé. Attendez la confirmation avant de tester.

### Index 2 : Commentaires par idée (RECOMMANDÉ)

Pour les requêtes `where('ideaId', '==', ideaId)` avec `orderBy('createdAt', 'asc')` :

1. Allez dans **Firebase Console > Firestore Database > Indexes**
2. Cliquez sur **Create Index**
3. Configurez :
   - **Collection ID** : `comments`
   - **Fields to index** :
     - `ideaId` : Ascending
     - `createdAt` : Ascending
   - **Query scope** : Collection
4. Cliquez sur **Create**

### Index 3 : Feedback par idée (OPTIONNEL)

Pour les requêtes `where('ideaId', '==', ideaId)` avec `orderBy('timestamp', 'desc')` :

Si vous utilisez les feedbacks, créez un index similaire pour la collection `feedback`.

## Test des Règles

Vous pouvez tester les règles dans **Firebase Console > Firestore Database > Rules > Rules Playground**.

### Tests Recommandés

1. **Lecture d'idée publique** : Doit réussir pour tous les utilisateurs authentifiés
2. **Lecture d'idée privée** : Doit réussir seulement pour le propriétaire
3. **Création d'idée** : Doit réussir pour utilisateur authentifié
4. **Modification d'idée** : Doit réussir seulement pour le propriétaire
5. **Suppression d'idée** : Doit réussir seulement pour le propriétaire
6. **Création de profil utilisateur** : Doit réussir pour l'utilisateur authentifié créant son propre profil
7. **Mise à jour de profil utilisateur** : Doit réussir seulement pour le propriétaire
8. **Création de commentaire** : Doit réussir pour utilisateur authentifié

## Dépannage des Erreurs de Permissions

### Erreur "Missing or insufficient permissions"

Si vous rencontrez cette erreur :

1. **Vérifiez que les règles sont déployées** :
   - Allez dans Firebase Console > Firestore Database > Rules
   - Vérifiez que les règles correspondent à `firestore.rules`
   - Cliquez sur "Publish" si nécessaire

2. **Vérifiez que l'utilisateur est authentifié** :
   - Ouvrez la console du navigateur
   - Vérifiez qu'il n'y a pas d'erreurs d'authentification
   - Testez la déconnexion et reconnexion

3. **Vérifiez les champs requis** :
   - Pour créer une idée : `userId` doit correspondre à `request.auth.uid`
   - Pour créer un profil : `userId` dans les données doit correspondre à l'ID du document et à `request.auth.uid`

4. **Vérifiez les requêtes** :
   - Pour les requêtes avec `where('isPublic', '==', true)`, tous les documents retournés doivent avoir `isPublic == true`
   - Assurez-vous que l'utilisateur est authentifié lors de la requête

### Problèmes Courants

#### Erreur lors de la sauvegarde du profil utilisateur
- **Cause** : Les règles ne permettent pas la création ou la mise à jour
- **Solution** : Vérifiez que les règles pour `userProfiles` permettent `create` et `update` avec les bonnes conditions

#### Erreur lors du chargement des idées publiques
- **Cause** : Les règles ne permettent pas la lecture des idées publiques
- **Solution** : Vérifiez que la règle `allow read` pour `ideas` permet la lecture si `isPublic == true`

#### Erreur lors de l'abonnement aux idées
- **Cause** : Les règles ne permettent pas les requêtes en temps réel
- **Solution** : Les règles `allow read` s'appliquent aussi aux requêtes (`onSnapshot`). Vérifiez que les conditions sont correctes.

