# Guide Rapide : Configuration Clé de Service Firebase

## 🎯 Résumé Rapide

1. **Firebase Console** → Paramètres du projet (⚙️) → **Service Accounts**
2. **Generate new private key** → Télécharge un fichier JSON
3. **Ouvrez le fichier JSON** et copiez tout son contenu
4. **Dans votre `.env`**, ajoutez :
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY='{collez le JSON ici sur une seule ligne}'
   ```
5. **Exécutez** : `npm run inject-ideas`

## 📖 Guide Complet

Pour plus de détails, consultez [`docs/GUIDE_CLES_SERVICE.md`](../docs/GUIDE_CLES_SERVICE.md)

## ⚠️ Sécurité

- ✅ Le fichier `.env` est déjà dans `.gitignore`
- ✅ NE JAMAIS commiter la clé de service
- ✅ La clé donne un accès ADMIN complet à votre projet

