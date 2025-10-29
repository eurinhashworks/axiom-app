# Guide de Déploiement des Règles Firestore

## ⚠️ IMPORTANT - Les règles doivent être déployées dans Firebase Console

Les erreurs "Missing or insufficient permissions" sont dues aux règles Firestore non déployées.

## Étapes de Déploiement

### Option 1 : Via Firebase Console (Recommandé)

1. **Ouvrez Firebase Console**
   - Allez sur https://console.firebase.google.com
   - Sélectionnez votre projet : `axiom-app-3ec61`

2. **Accédez aux règles Firestore**
   - Dans le menu de gauche, cliquez sur **Firestore Database**
   - Cliquez sur l'onglet **Rules** en haut de la page

3. **Copiez les règles**
   - Ouvrez le fichier `firestore.rules` à la racine du projet
   - Sélectionnez tout le contenu (Ctrl+A / Cmd+A)
   - Copiez (Ctrl+C / Cmd+C)

4. **Collez dans Firebase Console**
   - Collez les règles dans l'éditeur de la console Firebase
   - Cliquez sur **Publish** en haut à droite

5. **Vérifiez**
   - Vous devriez voir un message de confirmation
   - Les règles sont maintenant actives

### Option 2 : Via Firebase CLI

Si vous avez Firebase CLI installé :

```bash
# Installer Firebase CLI si nécessaire
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser Firebase (si pas déjà fait)
firebase init firestore

# Déployer les règles
firebase deploy --only firestore:rules
```

## Vérification Post-Déploiement

Après avoir déployé les règles :

1. **Rechargez votre application** dans le navigateur
2. **Connectez-vous** si vous n'êtes pas connecté
3. **Vérifiez la console** - les erreurs de permissions devraient avoir disparu

## Si les Erreurs Persistent

### Vérification 1 : Règles bien déployées
- Retournez dans Firebase Console > Firestore Database > Rules
- Vérifiez que les règles correspondent à `firestore.rules`
- Si différent, copiez-collez à nouveau et publiez

### Vérification 2 : Authentification
- Ouvrez la console du navigateur (F12)
- Vérifiez qu'il n'y a pas d'erreurs d'authentification
- Testez la déconnexion et reconnexion

### Vérification 3 : Structure des Données
- Dans Firebase Console > Firestore Database > Data
- Vérifiez que les documents ont les champs requis :
  - `ideas` : doit avoir `userId` et `isPublic` (optionnel)
  - `userProfiles` : doit avoir `userId`

## Règles Déployées

Les règles permettent :
- ✅ Lecture des idées : propriétaire ou idées publiques
- ✅ Création d'idées : utilisateur authentifié
- ✅ Modification d'idées : seulement le propriétaire
- ✅ Suppression d'idées : seulement le propriétaire
- ✅ Lecture des profils : tous les utilisateurs authentifiés
- ✅ Création/mise à jour de profil : seulement le propriétaire
- ✅ Commentaires : tous les utilisateurs authentifiés peuvent lire/créer

## Support

Si les problèmes persistent après le déploiement, vérifiez :
1. Que les règles sont bien publiées (pas seulement sauvegardées)
2. Que l'utilisateur est bien authentifié
3. Les logs dans la console du navigateur pour d'autres erreurs

