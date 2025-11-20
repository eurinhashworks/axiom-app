# 🎯 Sprint 3 : Strategic Planning Enrichi

## 📋 Objectif

Intégrer la dimension psychologique dans le plan stratégique et enrichir la visualisation avec la recommandation Go/No-Go.

---

## ✅ Tâches Backend

### 1. Étendre Strategic Planning
- [ ] Modifier `backend/src/services/gemini/gemini.service.ts`
  - [ ] Modifier `generateStrategicPlan(idea: Idea)` ou créer nouvelle fonction
  - [ ] Intégrer analyse psychologique dans plan stratégique
  - [ ] Inclure recommandation Go/No-Go dans plan
  - [ ] Adapter plan selon barrières psychologiques identifiées

### 2. Structure Plan Stratégique Enrichi
- [ ] Modifier `backend/src/types/shared.ts`
  - [ ] Interface `StrategicPlan` enrichie :
    ```typescript
    interface StrategicPlan {
      // Existant
      executiveSummary: string;
      objectives: Objective[];
      milestones: Milestone[];
      
      // Nouveau
      goNoGoIntegration: GoNoGoRecommendation;
      psychologicalConsiderations: {
        motivationAlignment: string;
        confidenceBuilding: string[];
        barrierMitigation: string[];
      };
      riskMitigation: {
        psychologicalRisks: string[];
        marketRisks: string[];
        technicalRisks: string[];
      };
    }
    ```

---

## ✅ Tâches Frontend

### 3. Composants UI

#### 3.1 StrategicPlanView Enrichi
- [ ] Modifier `components/session/StrategicPlanView.tsx` (si existe) ou créer
  - [ ] Affichage plan stratégique complet
  - [ ] Section Go/No-Go intégrée en haut
  - [ ] Section considérations psychologiques
  - [ ] Section mitigation risques (psychologiques + autres)

#### 3.2 PlanComparisonView
- [ ] Créer `components/dashboard/PlanComparisonView.tsx`
  - [ ] Comparer plans stratégiques de plusieurs idées
  - [ ] Tableau : Objectifs, Go/No-Go, Risques, Score
  - [ ] Filtres par critères

#### 3.3 RiskMitigationView
- [ ] Créer `components/session/RiskMitigationView.tsx`
  - [ ] Liste risques (psychologiques, marché, technique)
  - [ ] Stratégies de mitigation pour chacun
  - [ ] Priorisation risques (high/medium/low)
  - [ ] Actions préventives

### 4. Navigation et Intégration
- [ ] Modifier `components/session/AnalysisComplete.tsx`
  - [ ] Ajouter section "Plan Stratégique Enrichi"
  - [ ] Intégrer Go/No-Go de manière proéminente
  - [ ] Liens entre sections (Analyse → SWOT → Plan → Roadmap)

---

## ✅ Critères de Succès

- [ ] Plan stratégique inclut dimension psychologique
- [ ] Recommandation Go/No-Go intégrée dans plan
- [ ] Visualisation claire et actionnable
- [ ] Navigation fluide entre sections
- [ ] Comparaison plans fonctionnelle (si plusieurs idées)

---

## 🎯 Priorité : MOYENNE

**Durée estimée :** 3-5 jours  
**Complexité :** Faible-Moyenne

---

**Sprint précédent :** [Sprint 2 - Psychologie](./SPRINT_2_PSYCHOLOGIE.md)  
**Prochain Sprint :** [Sprint 4 - Roadmap Visuelle Interactive](./SPRINT_4_ROADMAP_VISUELLE.md)

