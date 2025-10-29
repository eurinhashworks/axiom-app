# Script d'injection des 200 idées publiques

## Résumé

Ce script injecte automatiquement **200 idées publiques** dans Firestore à partir du fichier `docs/200_idee.md`.

Chaque idée sera créée avec :
- ✅ Brain dump détaillé et réaliste
- ✅ Analyse IA complète (résumé, questions, risques)
- ✅ Évaluation complète (scores sur 10 critères)
- ✅ Scores d'opportunité et faisabilité calculés
- ✅ Roadmap générée (5-7 étapes, 2 complétées)
- ✅ Statut `ROADMAP_GENERATED`
- ✅ `isPublic: true`
- ✅ Auteur fictif assigné (10 auteurs différents)

## Méthodes d'authentification

### Option 1 : Clé de service Firebase (Recommandée)

1. Allez dans **Firebase Console > Project Settings > Service Accounts**
2. Cliquez sur **Generate New Private Key**
3. Sauvegardez le fichier JSON
4. Ajoutez dans votre `.env` :
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
   ```
   (Copiez tout le contenu JSON du fichier téléchargé)

### Option 2 : Fichier de clé de service

1. Téléchargez la clé de service depuis Firebase Console
2. Sauvegardez-la dans le projet (ex: `firebase-service-account.json`)
3. Ajoutez dans votre `.env` :
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   ```

### Option 3 : Modifier temporairement les règles Firestore

Pour un test rapide, modifiez temporairement les règles dans **Firebase Console > Firestore > Rules** :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ideas/{ideaId} {
      allow read, write: if true; // ⚠️ TEMPORAIRE
    }
  }
}
```

**⚠️ IMPORTANT : Remettez les règles de sécurité après l'injection !**

## Exécution

```bash
npm run inject-ideas
```

Le script affichera :
- Le nombre d'idées trouvées
- La progression (toutes les 10 idées)
- Le nombre d'idées injectées avec succès
- Les erreurs éventuelles

## Vérification

Après l'injection, vérifiez dans **Firebase Console > Firestore Database** :
- ✅ 200 documents dans la collection `ideas`
- ✅ Tous avec `isPublic: true`
- ✅ Statut `ROADMAP_GENERATED`
- ✅ Scores d'opportunité et faisabilité présents

## Notes

- Le script utilise Firebase Admin SDK qui contourne les règles de sécurité
- Les dates de création sont aléatoires sur les 6 derniers mois
- 10 auteurs fictifs sont assignés de manière circulaire
- Les scores sont calculés de manière réaliste (6-8/10 en moyenne)
