# AXIOM : Suite de Clarté Stratégique IA

AXIOM est une application web conçue pour agir comme un co-pilote stratégique. Elle transforme les "brain dumps" chaotiques et les idées naissantes en analyses structurées, en évaluations objectives et en feuilles de route actionnables, le tout alimenté par l'IA de Google.

## Fonctionnalités Principales

- **Analyse par l'IA :** Soumettez une idée brute (texte ou voix) et recevez un résumé concis, des questions de clarification et une analyse des risques potentiels.
- **Évaluation Stratégique :** L'IA évalue chaque idée sur des critères clés (Opportunité, Faisabilité) et fournit des scores détaillés.
- **Feuille de Route Interactive :** Générez une feuille de route en 5 étapes pour votre idée et suivez votre progression grâce à une checklist interactive.
- **Tableau de Bord Visuel :** Gérez toutes vos idées en un seul endroit. Visualisez-les sous forme de cartes, triez-les par score ou date, et filtrez-les par titre.
- **Matrice Stratégique :** Une vue graphique de type "matrice BCG" positionne vos idées sur un axe Opportunité vs. Faisabilité pour une prise de décision rapide.
- **Priorisation par l'IA :** Sélectionnez plusieurs idées évaluées et demandez à l'IA de les classer par ordre de priorité, avec une justification de type capital-risqueur.
- **Exportation Facile :** Exportez le dossier complet de votre idée (analyse, scores, feuille de route) au format Markdown.

---

## Démarrage Rapide (Lancement en Local)

Pour lancer ce projet, vous n'avez besoin que d'une seule chose : une clé API de Google pour Gemini.

### Étape 1 : Créer le fichier d'environnement

À la racine du projet, créez un nouveau fichier nommé `.env`.

### Étape 2 : Configurer la clé API Gemini

Ouvrez le fichier `.env` que vous venez de créer et ajoutez la ligne suivante :

```
REACT_APP_API_KEY=VOTRE_CLÉ_API_GEMINI_ICI
```

**Comment obtenir votre clé API ?**

1.  Allez sur le site de **Google AI Studio** : [https://aistudio.google.com/](https://aistudio.google.com/)
2.  Connectez-vous avec votre compte Google.
3.  Cliquez sur le bouton **"Get API key"** (Obtenir une clé API).
4.  Copiez la clé générée et collez-la dans votre fichier `.env` à la place de `VOTRE_CLÉ_API_GEMINI_ICI`.

### Étape 3 : Lancer le projet

Une fois votre fichier `.env` configuré, vous pouvez lancer l'application. Si vous êtes dans un environnement de développement local standard, les commandes seraient :

```bash
# Installer les dépendances (si ce n'est pas déjà fait)
npm install

# Lancer l'application
npm start
```

Si vous êtes dans l'environnement de développement AI Studio, il vous suffit de recharger l'aperçu de l'application après avoir configuré la clé secrète.
