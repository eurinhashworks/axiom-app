# 🚀 Index des Sprints - Workflow Enrichi

## 📋 Vue d'Ensemble

Ce document référence tous les sprints du workflow enrichi AXIOM. Chaque sprint est détaillé dans son propre fichier avec tâches, critères de succès et notes techniques.

---

## 🎯 Sprints du Workflow Enrichi

### Sprint 1 : Recherche Web + SWOT + Go/No-Go
**📄 Fichier :** [SPRINT_1_RECHERCHE_WEB_SWOT.md](./SPRINT_1_RECHERCHE_WEB_SWOT.md)

**Objectif :** Intégrer recherche web active (Serper API), analyse SWOT, comparaison concurrentielle et recommandation Go/No-Go.

**Durée :** 1-2 semaines  
**Complexité :** Moyenne  
**Priorité :** HAUTE

**Livrables :**
- Service Serper intégré
- Analyse SWOT automatique
- Composants : SWOTAnalysisView, CompetitiveComparisonView, GoNoGoDecisionView

---

### Sprint 2 : Dimension Psychologique
**📄 Fichier :** [SPRINT_2_PSYCHOLOGIE.md](./SPRINT_2_PSYCHOLOGIE.md)

**Objectif :** Analyser motivation, impact émotionnel, identifier barrières psychologiques et créer stratégie d'encouragement personnalisée.

**Durée :** 1 semaine  
**Complexité :** Moyenne  
**Priorité :** MOYENNE

**Livrables :**
- Analyse psychologique dans backend
- Composants : PsychologicalAnalysisView, EncouragementWidget, BarriersView
- Messages contextuels personnalisés

---

### Sprint 3 : Strategic Planning Enrichi
**📄 Fichier :** [SPRINT_3_STRATEGIC_PLANNING.md](./SPRINT_3_STRATEGIC_PLANNING.md)

**Objectif :** Intégrer dimension psychologique dans plan stratégique et enrichir visualisation avec Go/No-Go.

**Durée :** 3-5 jours  
**Complexité :** Faible-Moyenne  
**Priorité :** MOYENNE

**Livrables :**
- Plan stratégique enrichi
- Composants : StrategicPlanView enrichi, RiskMitigationView
- Navigation améliorée

---

### Sprint 4 : Guided Steps + Roadmap Visuelle Interactive ⭐ CŒUR
**📄 Fichier :** [SPRINT_4_ROADMAP_VISUELLE.md](./SPRINT_4_ROADMAP_VISUELLE.md)

**Objectif :** Créer roadmap visuelle interactive (roadmap.sh style) avec guidance psychologique, zoom, pan, click.

**Durée :** 2-3 semaines  
**Complexité :** Élevée  
**Priorité :** HAUTE (CŒUR DU PRODUIT)

**Livrables :**
- VisualRoadmapCanvas avec React Flow
- RoadmapNode personnalisé
- Layouts : Timeline, Flow, Gantt, Kanban
- Guidance psychologique par étape

---

### Sprint 5 : Interactive Dashboard + Canvas
**📄 Fichier :** [SPRINT_5_INTERACTIVE_DASHBOARD.md](./SPRINT_5_INTERACTIVE_DASHBOARD.md)

**Objectif :** Dashboard interactif avec navigation fluide, système progression avec célébrations, intégration roadmap visuelle.

**Durée :** 1-2 semaines  
**Complexité :** Moyenne  
**Priorité :** MOYENNE

**Livrables :**
- Navigation liste ↔ graphique ↔ roadmap
- Système progression et milestones
- Célébrations visuelles
- ActivityTimeline

---

### Sprint 6 : Accompagnement Intelligent & Émotionnel
**📄 Fichier :** [SPRINT_6_ACCOMPAGNEMENT_INTELLIGENT.md](./SPRINT_6_ACCOMPAGNEMENT_INTELLIGENT.md)

**Objectif :** Détection bloqueurs, suggestions adaptatives, encouragement automatique, célébrations milestones.

**Durée :** 1-2 semaines  
**Complexité :** Moyenne-Élevée  
**Priorité :** MOYENNE

**Livrables :**
- Service détection bloqueurs
- Suggestions adaptatives
- Encouragement automatique
- Célébrations animations

---

## 📊 Résumé Global

| Sprint | Durée | Complexité | Priorité | Fichier |
|--------|-------|------------|----------|---------|
| 1. Recherche Web + SWOT | 1-2 sem | Moyenne | HAUTE | [SPRINT_1](./SPRINT_1_RECHERCHE_WEB_SWOT.md) |
| 2. Psychologie | 1 sem | Moyenne | MOYENNE | [SPRINT_2](./SPRINT_2_PSYCHOLOGIE.md) |
| 3. Strategic Planning | 3-5 jours | Faible-Moyenne | MOYENNE | [SPRINT_3](./SPRINT_3_STRATEGIC_PLANNING.md) |
| 4. Roadmap Visuelle ⭐ | 2-3 sem | Élevée | HAUTE | [SPRINT_4](./SPRINT_4_ROADMAP_VISUELLE.md) |
| 5. Dashboard Interactif | 1-2 sem | Moyenne | MOYENNE | [SPRINT_5](./SPRINT_5_INTERACTIVE_DASHBOARD.md) |
| 6. Accompagnement | 1-2 sem | Moyenne-Élevée | MOYENNE | [SPRINT_6](./SPRINT_6_ACCOMPAGNEMENT_INTELLIGENT.md) |

**Durée totale estimée :** 6-10 semaines

---

## 🎯 Ordre Recommandé d'Implémentation

1. **Sprint 1** → Base solide (recherche web, SWOT, Go/No-Go)
2. **Sprint 4** → Cœur du produit (roadmap visuelle)
3. **Sprint 2** → Enrichissement (psychologie)
4. **Sprint 3** → Intégration (plan stratégique)
5. **Sprint 5** → Expérience (dashboard interactif)
6. **Sprint 6** → Finition (accompagnement)

**Alternative :** Si besoin de MVP rapide, focus sur Sprint 1 + Sprint 4 uniquement.

---

## 📝 Notes Importantes

- **Dépendances :** Certains sprints dépendent d'autres (ex: Sprint 3 dépend de Sprint 1 et 2)
- **Parallélisation :** Sprints 2 et 5 peuvent être partiellement parallélisés
- **Tests :** Chaque sprint doit inclure tests unitaires et tests d'intégration
- **Documentation :** Mettre à jour documentation API après chaque sprint

---

## 🔗 Liens Utiles

- [TODO_WORKFLOW.md](./TODO_WORKFLOW.md) - Vue d'ensemble complète des tâches
- [MIGRATION_API_CLIENT_RESUME.md](./MIGRATION_API_CLIENT_RESUME.md) - État migration vers apiClient
- [ROUTES_BACKEND_AJOUTEES.md](./ROUTES_BACKEND_AJOUTEES.md) - Routes backend ajoutées

---

**Dernière mise à jour :** Création des sprints workflow enrichi

