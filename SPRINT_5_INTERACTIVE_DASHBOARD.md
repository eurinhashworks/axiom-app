# 📊 Sprint 5 : Interactive Dashboard + Canvas

## 📋 Objectif

Créer un dashboard interactif avec navigation fluide entre liste et graphique, système de progression avec célébrations, et intégration de la roadmap visuelle.

---

## ✅ Tâches Frontend

### 1. Navigation Liste ↔ Graphique

#### 1.1 ViewToggle Amélioré
- [ ] Modifier `components/dashboard/ViewToggle.tsx` (existe déjà)
  - [ ] Ajouter mode "Roadmap Visuelle"
  - [ ] Toggle entre : Liste / Graphique / Roadmap Visuelle
  - [ ] Persister préférence utilisateur (localStorage)

#### 1.2 Dashboard State Management
- [ ] Modifier `pages/DashboardPage.tsx`
  - [ ] Ajouter état `viewMode: 'list' | 'graph' | 'roadmap'`
  - [ ] Navigation fluide entre modes
  - [ ] Animation de transition

### 2. Système de Progression

#### 2.1 ProgressTracker
- [ ] Créer `components/dashboard/ProgressTracker.tsx`
  - [ ] Barre de progression globale (toutes idées)
  - [ ] Progression par idée
  - [ ] Calcul automatique : étapes complétées / total
  - [ ] Graphique évolution dans le temps

#### 2.2 MilestoneSystem
- [ ] Créer `components/dashboard/MilestoneSystem.tsx`
  - [ ] Définir milestones (10%, 25%, 50%, 75%, 100%)
  - [ ] Détection automatique atteinte milestone
  - [ ] Badges/achievements visuels
  - [ ] Historique milestones atteints

#### 2.3 CelebrationComponent
- [ ] Créer `components/dashboard/CelebrationComponent.tsx`
  - [ ] Animation célébration au milestone
  - [ ] Confettis (optionnel, léger)
  - [ ] Message de félicitations personnalisé
  - [ ] Son (optionnel, désactivable)

### 3. Intégration Roadmap Visuelle

#### 3.1 DashboardRoadmapView
- [ ] Créer `components/dashboard/DashboardRoadmapView.tsx`
  - [ ] Vue roadmap visuelle dans dashboard
  - [ ] Toutes idées sur même canvas (optionnel)
  - [ ] Ou roadmap de l'idée active
  - [ ] Filtres : Par idée, par phase, par statut

#### 3.2 QuickRoadmapPreview
- [ ] Modifier `components/dashboard/IdeaCard.tsx` ou `IdeaCardEnhanced.tsx`
  - [ ] Mini preview roadmap dans card
  - [ ] Progress bar visuelle
  - [ ] Click → Vue complète roadmap

### 4. Canvas Interactif Dashboard

#### 4.1 DashboardCanvas
- [ ] Créer `components/dashboard/DashboardCanvas.tsx`
  - [ ] Canvas principal dashboard
  - [ ] Intégrer `VisualRoadmapCanvas` si roadmap mode
  - [ ] Intégrer `GraphView` si graph mode (existe déjà)
  - [ ] Navigation fluide

#### 4.2 DashboardToolbar
- [ ] Créer `components/dashboard/DashboardToolbar.tsx`
  - [ ] Contrôles canvas (zoom, pan, reset)
  - [ ] Filtres globaux
  - [ ] Export options
  - [ ] Settings (toggle animations, etc.)

### 5. Progression et Next Steps

#### 5.1 ProgressAndNext (Existe déjà)
- [ ] Modifier `components/dashboard/ProgressAndNext.tsx`
  - [ ] Améliorer visuels
  - [ ] Intégrer célébrations
  - [ ] Lien direct vers next step

#### 5.2 ActivityTimeline
- [ ] Créer `components/dashboard/ActivityTimeline.tsx`
  - [ ] Timeline activités récentes
  - [ ] Étapes complétées, idées créées, etc.
  - [ ] Scroll infini
  - [ ] Filtres par type activité

---

## ✅ Critères de Succès

- [ ] Navigation fluide liste ↔ graphique ↔ roadmap
- [ ] Système progression fonctionnel et précis
- [ ] Célébrations affichées au bon moment
- [ ] Roadmap visuelle intégrée dans dashboard
- [ ] Performance acceptable (pas de lag)
- [ ] Responsive (mobile/desktop)

---

## 🎨 Design Guidelines

- **Transitions :** Fluides (300-500ms), easing naturel
- **Célébrations :** Subtiles, pas intrusives
- **Progression :** Visualisation claire, intuitive
- **Navigation :** Breadcrumbs, indicateurs actifs

---

## 📝 Notes Techniques

- **State Management :** Utiliser React Context ou Zustand si complexité
- **Performance :** Lazy loading roadmap si beaucoup d'idées
- **Persistence :** Sauvegarder préférences vue, progression
- **Analytics :** Track progression, milestones atteints (optionnel)

---

## 🎯 Priorité : MOYENNE

**Durée estimée :** 1-2 semaines  
**Complexité :** Moyenne

---

**Sprint précédent :** [Sprint 4 - Roadmap Visuelle](./SPRINT_4_ROADMAP_VISUELLE.md)  
**Prochain Sprint :** [Sprint 6 - Accompagnement Intelligent](./SPRINT_6_ACCOMPAGNEMENT_INTELLIGENT.md)

