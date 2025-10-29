# 🎯 Guide Détaillé : Configuration de la Clé de Service Firebase

## 📍 Étape par Étape avec Screenshots

### Étape 1 : Accéder à Firebase Console

1. **Ouvrez votre navigateur** et allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Connectez-vous** avec votre compte Google

3. **Sélectionnez votre projet** `axiom-app-3ec61`

---

### Étape 2 : Accéder aux Paramètres du Projet

1. **En haut à gauche**, vous verrez le nom de votre projet avec une **icône d'engrenage** (⚙️) à côté

2. **Cliquez sur l'icône d'engrenage** → Un menu déroulant apparaît

3. **Cliquez sur "Project settings"** (Paramètres du projet)

   *Une nouvelle page s'ouvre avec plusieurs onglets : General, Service Accounts, etc.*

---

### Étape 3 : Aller dans l'Onglet "Service Accounts"

1. **En haut de la page**, vous verrez plusieurs onglets :
   - General
   - **Service Accounts** ← Cliquez ici
   - Users and permissions
   - etc.

2. **Cliquez sur l'onglet "Service Accounts"**

   *Vous verrez maintenant :*
   - Un code d'exemple pour différents langages (Node.js, Python, etc.)
   - Un bouton **"Generate new private key"** (Générer une nouvelle clé privée)

---

### Étape 4 : Générer la Clé de Service

1. **Trouvez le bouton "Generate new private key"** (il est généralement en bleu)

2. **Cliquez sur "Generate new private key"**

3. **Une popup d'avertissement apparaîtra** qui dit quelque chose comme :
   ```
   ⚠️ Warning
   You are about to generate a new private key for this service account.
   This key will give anyone who has it full access to your Firebase project.
   Make sure to keep it secure and do not share it publicly.
   ```

4. **Cliquez sur "Generate key"** pour confirmer

5. **Un fichier JSON sera téléchargé automatiquement** dans votre dossier de téléchargements
   - Le nom du fichier ressemblera à : `axiom-app-3ec61-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`

---

### Étape 5 : Ouvrir et Examiner le Fichier JSON

1. **Allez dans votre dossier de téléchargements** (généralement `C:\Users\cyberbeast\Downloads`)

2. **Ouvrez le fichier JSON** avec :
   - **VS Code** (recommandé) : Clic droit → Ouvrir avec → VS Code
   - **Notepad** : Clic droit → Ouvrir avec → Notepad
   - Ou tout autre éditeur de texte

3. **Le contenu ressemblera à ceci :**
   ```json
   {
     "type": "service_account",
     "project_id": "axiom-app-3ec61",
     "private_key_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@axiom-app-3ec61.iam.gserviceaccount.com",
     "client_id": "123456789012345678901",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40axiom-app-3ec61.iam.gserviceaccount.com"
   }
   ```

---

### Étape 6 : Copier le Contenu JSON

#### Méthode A : Copier le JSON Formaté (Plus Simple)

1. **Dans votre éditeur**, sélectionnez **TOUT le contenu** du fichier JSON :
   - Windows/Linux : `Ctrl + A`
   - Mac : `Cmd + A`

2. **Copiez-le** :
   - Windows/Linux : `Ctrl + C`
   - Mac : `Cmd + C`

3. **Ouvrez votre fichier `.env`** à la racine du projet :
   - Chemin : `C:\Users\cyberbeast\Videos\axiom-app\.env`
   - Si le fichier n'existe pas, créez-le

4. **À la fin du fichier `.env`**, ajoutez une nouvelle ligne :
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY='{collez ici le JSON que vous venez de copier}'
   ```

   **⚠️ IMPORTANT :**
   - Le JSON doit être sur **UNE SEULE LIGNE** (pas de retours à la ligne)
   - Entourez-le de **guillemets simples** (`'...'`)
   - Si le JSON contient des guillemets simples, remplacez-les par `\'` ou utilisez des guillemets doubles pour entourer

#### Exemple de Format Final dans `.env` :

```env
# Vos variables Firebase existantes
VITE_FIREBASE_API_KEY=AIzaSyBmThbWYRU1ROIk9eaiGDemVjvn6CN15rc
VITE_FIREBASE_AUTH_DOMAIN=axiom-app-3ec61.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=axiom-app-3ec61
VITE_FIREBASE_STORAGE_BUCKET=axiom-app-3ec61.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Nouvelle clé de service pour l'injection des idées
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"axiom-app-3ec61","private_key_id":"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxxxx@axiom-app-3ec61.iam.gserviceaccount.com","client_id":"123456789012345678901","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40axiom-app-3ec61.iam.gserviceaccount.com"}'
```

**Note :** Les `\n` dans `private_key` doivent être écrits comme `\\n` (double backslash)

---

### Étape 7 : Alternative Simpler - Utiliser le Fichier Directement

Si copier le JSON sur une seule ligne est trop complexe, vous pouvez :

1. **Copiez le fichier JSON** dans votre projet (par exemple à la racine) :
   ```
   C:\Users\cyberbeast\Videos\axiom-app\firebase-service-account.json
   ```

2. **Renommez-le** en `firebase-service-account.json` (plus simple)

3. **Dans votre `.env`**, ajoutez simplement :
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   ```

4. **✅ C'est fait !** Le script utilisera automatiquement ce fichier

---

### Étape 8 : Vérifier et Tester

1. **Vérifiez que votre `.env` contient bien** la variable `FIREBASE_SERVICE_ACCOUNT_KEY` ou `GOOGLE_APPLICATION_CREDENTIALS`

2. **Dans votre terminal**, allez dans le dossier du projet :
   ```bash
   cd C:\Users\cyberbeast\Videos\axiom-app
   ```

3. **Testez la configuration** en exécutant :
   ```bash
   npm run inject-ideas
   ```

4. **Si tout fonctionne**, vous devriez voir :
   ```
   ✅ Firebase Admin initialisé avec clé de service
   📖 Lecture du fichier markdown...
   🔍 Parsing des idées...
   ✅ 200 idées trouvées
   📝 10/200 idées injectées...
   📝 20/200 idées injectées...
   ...
   ✅ Injection terminée !
   ✅ 200 idées injectées avec succès
   🎉 Script terminé avec succès !
   ```

---

## 🐛 Résolution de Problèmes Courants

### ❌ Erreur : "Configuration Firebase Admin manquante"

**Cause :** La variable d'environnement n'est pas trouvée

**Solution :**
1. Vérifiez que votre `.env` existe bien à la racine du projet
2. Vérifiez que la variable `FIREBASE_SERVICE_ACCOUNT_KEY` est bien présente
3. Assurez-vous qu'il n'y a pas d'espaces autour du `=`
4. Redémarrez votre terminal pour recharger les variables d'environnement

### ❌ Erreur : "Invalid JSON" ou "Unexpected token"

**Cause :** Le JSON n'est pas correctement formaté dans `.env`

**Solution :**
1. Vérifiez que le JSON est sur **une seule ligne**
2. Vérifiez que les guillemets sont correctement échappés
3. Utilisez plutôt la méthode alternative avec `GOOGLE_APPLICATION_CREDENTIALS`

### ❌ Erreur : "Permission denied"

**Cause :** La clé de service n'a pas les bonnes permissions

**Solution :**
1. Dans Firebase Console, allez dans **IAM & Admin > IAM**
2. Trouvez le compte de service (`firebase-adminsdk-xxxxx@...`)
3. Assurez-vous qu'il a le rôle **"Editor"** ou **"Owner"**

---

## 🔒 Sécurité : À Ne Jamais Faire

❌ **NE JAMAIS :**
- Commiter le fichier `.env` dans Git
- Commiter le fichier JSON de clé de service
- Partager la clé publiquement
- Mettre la clé dans du code source

✅ **TOUJOURS :**
- Garder le `.env` dans `.gitignore`
- Garder les fichiers JSON de clé dans `.gitignore`
- Utiliser des variables d'environnement sécurisées en production

---

## 📚 Ressources Supplémentaires

- [Documentation Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Générer une clé de service](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Variables d'environnement dans Node.js](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

---

Une fois que vous avez ajouté la clé dans votre `.env`, vous pouvez exécuter `npm run inject-ideas` et les 200 idées seront injectées dans votre base de données Firestore ! 🎉
