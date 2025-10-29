# Instructions Précises pour Créer l'Index Firestore

## ⚠️ Important : Pas d'espaces dans les noms de champs

L'erreur "Invalid property path" est causée par un espace ou un caractère invalide dans le nom du champ.

## Création de l'Index - Guide Pas à Pas

### Étape 1 : Accéder à la page des Index
1. Allez sur **Firebase Console** : https://console.firebase.google.com
2. Sélectionnez votre projet : **axiom-app-3ec61**
3. Dans le menu de gauche, cliquez sur **Firestore Database**
4. Cliquez sur l'onglet **Indexes** en haut de la page

### Étape 2 : Créer l'Index
1. Cliquez sur le bouton **Create Index** (bouton bleu en haut à droite)

### Étape 3 : Configurer les Champs (ATTENTION AUX ESPACES)

Dans le formulaire qui apparaît :

**Collection ID :**
- Tapez exactement (sans espaces avant ou après) : `ideas`
- ⚠️ Vérifiez qu'il n'y a pas d'espaces avant ou après

**Fields to index :**

**Premier champ :**
1. Cliquez sur **Add field**
2. Dans le champ **Field name**, tapez exactement : `userId`
   - ⚠️ Vérifiez : pas d'espaces avant ou après
   - ⚠️ Vérifiez : minuscules `userId` (pas `UserId` ou `USERID`)
3. Sélectionnez **Ascending** dans le menu déroulant

**Deuxième champ :**
1. Cliquez sur **Add field** à nouveau
2. Dans le champ **Field name**, tapez exactement : `createdAt`
   - ⚠️ Vérifiez : pas d'espaces avant ou après
   - ⚠️ Vérifiez : `createdAt` avec un "A" majuscule (pas `createdat` ou `CreatedAt`)
3. Sélectionnez **Descending** dans le menu déroulant

**Query scope :**
- Sélectionnez **Collection**

### Étape 4 : Créer l'Index
1. Cliquez sur **Create**
2. Attendez quelques minutes (1-5 minutes) que l'index soit créé
3. Le statut passera de "Building..." à "Enabled"

## Vérification

Après création, vous devriez voir un index avec :
- **Collection** : `ideas`
- **Fields** : `userId (Ascending)`, `createdAt (Descending)`
- **Status** : `Enabled`

## Si l'Erreur Persiste

### Solution 1 : Utiliser le Lien Automatique
Cliquez directement sur le lien dans l'erreur de la console du navigateur. Ce lien crée automatiquement l'index avec les bons paramètres.

### Solution 2 : Vérifier les Espaces
- Ne copiez-collez pas depuis la documentation si vous pensez qu'il y a des espaces cachés
- Tapez manuellement : `userId` puis `createdAt`
- Utilisez Ctrl+A pour sélectionner tout le texte dans le champ avant de taper

### Solution 3 : Créer via Firebase CLI (Alternative)

Si le problème persiste, vous pouvez créer l'index via fichier de configuration :

1. Créez un fichier `firestore.indexes.json` à la racine du projet :

```json
{
  "indexes": [
    {
      "collectionGroup": "ideas",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

2. Déployez avec :
```bash
firebase deploy --only firestore:indexes
```

## Format Correct des Noms de Champs

Les noms de champs doivent :
- ✅ Commencer par une lettre ou underscore
- ✅ Contenir uniquement lettres, chiffres et underscores
- ✅ Être exactement : `userId` et `createdAt` (sans espaces)

**Exemples CORRECTS :**
- `userId`
- `createdAt`
- `user_id`
- `created_at`

**Exemples INCORRECTS :**
- `userId ` (espace à la fin)
- ` userId` (espace au début)
- `user id` (espace au milieu)
- `user-id` (tiret)

