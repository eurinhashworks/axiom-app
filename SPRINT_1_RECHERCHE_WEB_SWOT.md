# 🚀 Sprint 1 : Recherche Web + SWOT + Go/No-Go

## 📋 Objectif

Intégrer la recherche web active via Serper API, l'analyse SWOT structurée, la comparaison concurrentielle et la recommandation Go/No-Go basée sur des données réelles.

---

## ✅ Tâches Backend

### 1. Service Serper

- [ ] Créer `backend/src/services/serper.service.ts`
  - [ ] Fonction `searchMarket(keywords: string)` : Recherche web via Serper API
  - [ ] Fonction `findCompetitors(ideaTitle: string, summary: string)` : Recherche concurrents
  - [ ] Fonction `analyzeTrends(keywords: string[])` : Analyse tendances marché
  - [ ] Gestion d'erreurs et retry logic
  - [ ] Configuration API key : `SERPER_API_KEY` dans `.env`

### 2. Étendre le Service Gemini

- [ ] Modifier `backend/src/services/gemini/gemini.service.ts`
  - [ ] Intégrer `serperService` dans `analyzeBrainDump()`
  - [ ] Ajouter recherche web automatique après analyse initiale
  - [ ] Fusionner résultats recherche avec analyse SWOT

### 3. Types et Interfaces

- [ ] Créer/Modifier `backend/src/types/shared.ts`
  - [ ] Interface `SWOTAnalysis` :

    ```typescript
    interface SWOTAnalysis {
      strengths: Strength[];
      weaknesses: Weakness[];
      opportunities: Opportunity[];
      threats: Threat[];
      strategicImplications: string[];
    }
    ```

  - [ ] Interface `WebResearchResults` :

    ```typescript
    interface WebResearchResults {
      competitors: Competitor[];
      marketTrends: MarketTrend[];
      newsArticles: NewsArticle[];
      searchQueries: string[];
    }
    ```

  - [ ] Interface `CompetitiveAnalysis` :

    ```typescript
    interface CompetitiveAnalysis {
      directCompetitors: Competitor[];
      indirectCompetitors: Competitor[];
      competitiveAdvantages: string[];
      competitiveGaps: string[];
      marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
    }
    ```

  - [ ] Interface `GoNoGoRecommendation` :

    ```typescript
    interface GoNoGoRecommendation {
      decision: 'go' | 'no-go' | 'pivot' | 'wait';
      confidence: number; // 0-100
      rationale: string;
      keyFactors: {
        positive: string[];
        negative: string[];
      };
      conditions: string[];
    }
    ```

### 4. Route Backend

- [ ] Modifier `backend/src/routes/analysis.routes.ts`
  - [ ] Étendre route `POST /api/v1/analysis/analyze`
  - [ ] Ajouter recherche web dans le processus d'analyse
  - [ ] Retourner `SWOTAnalysis`, `WebResearchResults`, `CompetitiveAnalysis`, `GoNoGoRecommendation`

---

## ✅ Tâches Frontend

### 5. Types Frontend

- [ ] Modifier `types.ts`
  - [ ] Ajouter toutes les interfaces de SWOT, recherche web, etc.
  - [ ] Étendre `Idea` avec nouveaux champs :

    ```typescript
    interface Idea {
      // ... existant
      swotAnalysis?: SWOTAnalysis;
      webResearch?: WebResearchResults;
      competitiveAnalysis?: CompetitiveAnalysis;
      goNoGo?: GoNoGoRecommendation;
    }
    ```

### 6. API Client

- [ ] Modifier `services/apiClient.ts`
  - [ ] La route `/analyze` retournera déjà les nouvelles données
  - [ ] Aucun changement nécessaire (données ajoutées à la réponse existante)

### 7. Composants UI

#### 7.1 SWOTAnalysisView

- [ ] Créer `components/dashboard/SWOTAnalysisView.tsx`
  - [ ] Matrice SWOT interactive (4 quadrants)
  - [ ] Affichage : Forces, Faiblesses, Opportunités, Menaces
  - [ ] Style : Cards colorées par quadrant
  - [ ] Animation au chargement

#### 7.2 CompetitiveComparisonView

- [ ] Créer `components/dashboard/CompetitiveComparisonView.tsx`
  - [ ] Tableau comparatif visuel des concurrents
  - [ ] Colonnes : Nom, Type, Avantages, Notes
  - [ ] Filtres : Direct vs Indirect
  - [ ] Liens vers sites concurrents (si disponible)

#### 7.3 GoNoGoDecisionView

- [ ] Créer `components/dashboard/GoNoGoDecisionView.tsx`
  - [ ] Affichage impactant de la recommandation
  - [ ] Badge de décision coloré : Go (vert), No-Go (rouge), Pivot (orange), Wait (jaune)
  - [ ] Niveau de confiance (barre de progression)
  - [ ] Facteurs clés (positifs/négatifs)
  - [ ] Conditions à remplir

#### 7.4 WebResearchResultsView

- [ ] Créer `components/dashboard/WebResearchResultsView.tsx`
  - [ ] Liste des concurrents trouvés
  - [ ] Tendances marché
  - [ ] Articles de presse pertinents
  - [ ] Sources cliquables

### 8. Intégration dans SessionPage

- [ ] Modifier `components/session/AnalysisView.tsx` ou créer nouvelle vue
  - [ ] Afficher SWOT après analyse
  - [ ] Afficher recherche web
  - [ ] Afficher Go/No-Go de manière proéminente
  - [ ] Navigation : Analyse → SWOT → Recherche → Go/No-Go

---

## 📦 Dépendances

### Packages Backend

```json
{
  "axios": "^1.6.0" // Pour appels Serper API
}
```

### Packages Frontend
Aucun nouveau package nécessaire (React déjà présent)

---

## 🔧 Configuration

### Variables d'Environnement Backend

```env
SERPER_API_KEY=your_serper_api_key_here
```

### Obtention Clé Serper API

1. Aller sur https://serper.dev/
2. Créer un compte
3. Obtenir la clé API
4. Ajouter dans `backend/.env`

---

## ✅ Critères de Succès

- [ ] Recherche web active fonctionne via Serper API
- [ ] Analyse SWOT générée automatiquement pour chaque idée analysée
- [ ] Comparaison concurrentielle disponible
- [ ] Recommandation Go/No-Go affichée clairement
- [ ] Tous les composants UI fonctionnent
- [ ] Pas d'erreurs dans les logs
- [ ] Tests manuels passés (analyser une idée et vérifier toutes les sections)

---

## 📝 Notes Techniques

- **Serper API** : Service de recherche Google (alternative à l'API Google Search)
- **Performance** : La recherche web peut prendre 2-5 secondes, prévoir loading state
- **Erreurs** : Si Serper API échoue, continuer avec analyse SWOT basique (sans recherche web)
- **Caching** : Considérer cache des résultats recherche web pour éviter appels répétés

---

## 🎯 Priorité : HAUTE

**Durée estimée :** 1-2 semaines  
**Complexité :** Moyenne

---

**Prochain Sprint :** [Sprint 2 - Dimension Psychologique](./SPRINT_2_PSYCHOLOGIE.md)

