# Guide de Déploiement Firebase - Axiom App

## 📋 Prérequis

- Node.js 18+ installé
- Firebase CLI installé (`npm install -g firebase-tools`)
- Compte Firebase configuré
- Variables d'environnement configurées

## 🔧 Configuration

### 1. Variables d'Environnement Firebase Functions

Les variables d'environnement pour les Firebase Functions doivent être configurées via Firebase CLI:

```bash
# Configurer les variables d'environnement pour les fonctions
firebase functions:config:set gemini.api_key="VOTRE_CLE_API_GEMINI"
firebase functions:config:set serper.api_key="VOTRE_CLE_API_SERPER"
```

### 2. Configuration Firebase

Le projet est déjà configuré avec:
- **Project ID**: `axiom-app-3ec61`
- **Hosting**: Déploiement du dossier `dist`
- **Functions**: Backend dans le dossier `functions`
- **Firestore**: Base de données avec règles de sécurité

## 🚀 Déploiement Complet

### Option 1: Déploiement Total (Recommandé)

```bash
# 1. Build du frontend
npm run build

# 2. Build des functions
cd functions && npm run build && cd ..

# 3. Déploiement complet (hosting + functions + firestore)
firebase deploy
```

### Option 2: Déploiement Sélectif

#### Déployer uniquement le Hosting (Frontend)
```bash
npm run build
firebase deploy --only hosting
```

#### Déployer uniquement les Functions (Backend)
```bash
cd functions && npm run build && cd ..
firebase deploy --only functions
```

#### Déployer uniquement Firestore (Rules + Indexes)
```bash
firebase deploy --only firestore
```

## 🔍 Vérification Post-Déploiement

### 1. Vérifier le Hosting
```bash
# L'URL sera affichée après le déploiement
# Format: https://axiom-app-3ec61.web.app
```

### 2. Vérifier les Functions
```bash
# Lister les fonctions déployées
firebase functions:list

# Voir les logs
firebase functions:log
```

### 3. Tester l'API
```bash
# Health check
curl https://us-central1-axiom-app-3ec61.cloudfunctions.net/api/health
```

## 📝 Configuration Frontend pour Firebase

Après le déploiement, vous devrez mettre à jour l'URL de l'API dans votre frontend:

### Fichier `.env.production`
```env
VITE_API_URL=https://us-central1-axiom-app-3ec61.cloudfunctions.net
```

Puis redéployer le frontend:
```bash
npm run build
firebase deploy --only hosting
```

## 🔐 Sécurité

### Règles Firestore
Les règles de sécurité sont définies dans `firestore.rules`:
- Authentification requise pour toutes les opérations
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les idées publiques sont lisibles par tous les utilisateurs authentifiés

### CORS
Les Firebase Functions gèrent automatiquement CORS pour les requêtes depuis votre domaine Firebase.

## 🐛 Dépannage

### Erreur: "Firebase CLI not found"
```bash
npm install -g firebase-tools
firebase login
```

### Erreur: "Insufficient permissions"
```bash
# Se reconnecter avec le bon compte
firebase logout
firebase login
```

### Erreur de build des functions
```bash
cd functions
npm install
npm run build
```

### Voir les logs d'erreur
```bash
firebase functions:log --only api
```

## 📊 Monitoring

### Console Firebase
- **Hosting**: https://console.firebase.google.com/project/axiom-app-3ec61/hosting
- **Functions**: https://console.firebase.google.com/project/axiom-app-3ec61/functions
- **Firestore**: https://console.firebase.google.com/project/axiom-app-3ec61/firestore

### Métriques importantes
- Nombre de requêtes aux functions
- Temps de réponse moyen
- Taux d'erreur
- Utilisation de Firestore

## 🔄 Workflow de Déploiement Recommandé

1. **Développement local**
   ```bash
   npm run dev  # Frontend
   firebase emulators:start  # Backend local
   ```

2. **Tests**
   - Tester toutes les fonctionnalités
   - Vérifier les règles Firestore
   - Valider l'authentification

3. **Build**
   ```bash
   npm run build
   cd functions && npm run build && cd ..
   ```

4. **Déploiement**
   ```bash
   firebase deploy
   ```

5. **Vérification**
   - Tester l'application déployée
   - Vérifier les logs
   - Monitorer les erreurs

## 📞 Support

En cas de problème:
1. Vérifier les logs: `firebase functions:log`
2. Consulter la console Firebase
3. Vérifier les variables d'environnement
4. S'assurer que toutes les dépendances sont installées

## 🎯 URLs Importantes

- **Application**: https://axiom-app-3ec61.web.app
- **API Functions**: https://us-central1-axiom-app-3ec61.cloudfunctions.net/api
- **Console Firebase**: https://console.firebase.google.com/project/axiom-app-3ec61
