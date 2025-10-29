# Erreur NOT_FOUND : Firestore non activé

## ⚠️ Problème

L'erreur `5 NOT_FOUND` signifie que **Firestore n'est pas activé** dans votre projet Firebase.

## ✅ Solution : Activer Firestore

### Étape 1 : Activer Firestore Database

1. **Allez dans Firebase Console** : [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Sélectionnez votre projet** `axiom-app-3ec61`

3. **Dans le menu de gauche**, cliquez sur **"Firestore Database"**

4. **Si vous voyez un bouton "Create database"** :
   - Cliquez dessus
   - Choisissez **"Start in production mode"** (vous pouvez changer les règles après)
   - Sélectionnez une **location** (ex: `us-central1` ou `europe-west1`)
   - Cliquez sur **"Enable"**

5. **Attendez quelques secondes** que la base de données soit créée

### Étape 2 : Vérifier les Règles Firestore

Une fois Firestore activé, vérifiez les règles :

1. **Dans Firestore Database**, allez dans l'onglet **"Rules"**

2. **Les règles actuelles** peuvent être :
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

3. **Pour permettre l'injection avec Admin SDK**, vous pouvez temporairement modifier les règles :
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /ideas/{ideaId} {
         allow read, write: if true; // ⚠️ TEMPORAIRE pour l'injection
       }
     }
   }
   ```

4. **Cliquez sur "Publish"** pour sauvegarder

### Étape 3 : Réessayer l'Injection

Une fois Firestore activé, réessayez :

```bash
npm run inject-ideas
```

---

## 🔍 Vérification Alternative

Si Firestore est déjà activé mais que vous avez toujours l'erreur :

1. **Vérifiez que votre projet Firebase est correct** :
   - Le `project_id` dans `firebase-service-account.json` doit correspondre
   - Dans Firebase Console > Project Settings > General, vérifiez le Project ID

2. **Vérifiez les permissions de la clé de service** :
   - Firebase Console > IAM & Admin > IAM
   - Trouvez le compte `firebase-adminsdk-xxxxx@...`
   - Il doit avoir le rôle **"Editor"** ou **"Owner"**

---

Une fois Firestore activé, le script devrait fonctionner ! 🎉

