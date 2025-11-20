# 🤖 Sprint 6 : Accompagnement Intelligent & Émotionnel

## 📋 Objectif

Implémenter la détection de bloqueurs, les suggestions adaptatives, l'encouragement émotionnel automatique et les célébrations de milestones avec animations.

---

## ✅ Tâches Backend

### 1. Détection de Bloqueurs
- [ ] Créer `backend/src/services/blocker-detection.service.ts`
  - [ ] Fonction `detectBlockers(idea: Idea, userActivity: Activity[])`
  - [ ] Analyser patterns : pas d'activité depuis X jours
  - [ ] Détecter : Stagnation, répétition échecs, abandon
  - [ ] Types bloqueurs :
    ```typescript
    type BlockerType = 
      | 'stagnation'
      | 'overwhelm'
      | 'lack-of-clarity'
      | 'resource-constraint'
      | 'motivation-decline';
    ```

### 2. Suggestions Adaptatives
- [ ] Modifier `backend/src/services/gemini/gemini.service.ts`
  - [ ] Fonction `generateAdaptiveSuggestions(idea: Idea, context: Context)`
  - [ ] Suggestions basées sur :
    - État actuel idée
    - Historique utilisateur
    - Bloqueurs détectés
    - Profil psychologique

### 3. Encouragement Automatique
- [ ] Créer `backend/src/services/encouragement.service.ts`
  - [ ] Fonction `generateEncouragement(idea: Idea, milestone?: Milestone)`
  - [ ] Messages adaptés selon contexte
  - [ ] Timing intelligent (pas de spam)

---

## ✅ Tâches Frontend

### 4. Composants Détection Bloqueurs

#### 4.1 BlockerDetectionAlert
- [ ] Créer `components/dashboard/BlockerDetectionAlert.tsx`
  - [ ] Alert si bloqueur détecté
  - [ ] Type bloqueur avec icône
  - [ ] Suggestions actions
  - [ ] Bouton "J'ai besoin d'aide"

#### 4.2 BlockerResolutionFlow
- [ ] Créer `components/session/BlockerResolutionFlow.tsx`
  - [ ] Flow guidé résolution bloqueur
  - [ ] Questions diagnostiques
  - [ ] Solutions personnalisées
  - [ ] Tracking résolution

### 5. Suggestions Adaptatives UI

#### 5.1 AdaptiveSuggestionsPanel
- [ ] Créer `components/dashboard/AdaptiveSuggestionsPanel.tsx`
  - [ ] Panel suggestions contextuelles
  - [ ] Refresh automatique selon activité
  - [ ] Actions rapides (one-click)
  - [ ] Feedback utilisateur (utile/pas utile)

#### 5.2 SuggestionCard
- [ ] Créer `components/dashboard/SuggestionCard.tsx`
  - [ ] Card suggestion individuelle
  - [ ] Type : Action, Insight, Warning
  - [ ] Badge priorité
  - [ ] Action CTA

### 6. Encouragement Automatique

#### 6.1 EncouragementBanner
- [ ] Créer `components/dashboard/EncouragementBanner.tsx`
  - [ ] Banner encouragement contextuel
  - [ ] Affichage intelligent (pas toujours visible)
  - [ ] Animation douce apparition
  - [ ] Dismiss option

#### 6.2 EncouragementScheduler
- [ ] Créer `utils/encouragementScheduler.ts`
  - [ ] Logique timing encouragement
  - [ ] Éviter spam (max 1-2/jour)
  - [ ] Context-aware (éviter si utilisateur actif)

### 7. Célébrations Milestones

#### 7.1 MilestoneCelebration (Existe déjà partiellement)
- [ ] Améliorer `components/dashboard/MilestoneCelebration.tsx`
  - [ ] Animations confettis
  - [ ] Messages personnalisés
  - [ ] Son (optionnel)
  - [ ] Partage social (optionnel)
  - [ ] Historique célébrations

#### 7.2 CelebrationAnimation
- [ ] Créer `components/ui/CelebrationAnimation.tsx`
  - [ ] Animation confettis (canvas ou CSS)
  - [ ] Particules colorées
  - [ ] Effet "sparkle"
  - [ ] Performance optimisée

#### 7.3 MilestoneGallery
- [ ] Créer `components/dashboard/MilestoneGallery.tsx`
  - [ ] Galerie milestones atteints
  - [ ] Timeline visuelle
  - [ ] Partage/export

### 8. Intégration Dashboard

#### 8.1 Dashboard Notifications
- [ ] Modifier `pages/DashboardPage.tsx`
  - [ ] Système notifications intelligent
  - [ ] Bloqueurs → Alertes
  - [ ] Milestones → Célébrations
  - [ ] Suggestions → Panel contextuel

#### 8.2 Real-time Updates
- [ ] Utiliser Firestore listeners (si pas déjà)
  - [ ] Mise à jour temps réel progression
  - [ ] Détection bloqueurs en temps réel
  - [ ] Notifications push (optionnel)

---

## 📦 Dépendances

### Packages Frontend
```json
{
  "canvas-confetti": "^1.9.0", // Pour animations confettis
  "framer-motion": "^10.16.0" // Pour animations fluides
}
```

---

## ✅ Critères de Succès

- [ ] Détection bloqueurs fonctionnelle et précise
- [ ] Suggestions adaptatives pertinentes
- [ ] Encouragement automatique non intrusif
- [ ] Célébrations milestones visuelles et engageantes
- [ ] Performance acceptable (animations fluides)
- [ ] Personnalisation selon profil utilisateur

---

## 🎨 Design Guidelines

- **Encouragement :** Positif, empathique, jamais condescendant
- **Célébrations :** Joyeuses mais pas excessives
- **Suggestions :** Actionnables, spécifiques, pas vagues
- **Timing :** Intelligent, respecter cycles utilisateur

---

## 📝 Notes Techniques

- **Privacy :** Données activité stockées localement ou anonymisées
- **Performance :** Animations optimisées (requestAnimationFrame)
- **Analytics :** Track efficacité suggestions (optionnel)
- **A/B Testing :** Tester différents types encouragement (optionnel)

---

## 🎯 Priorité : MOYENNE

**Durée estimée :** 1-2 semaines  
**Complexité :** Moyenne-Élevée

---

**Sprint précédent :** [Sprint 5 - Interactive Dashboard](./SPRINT_5_INTERACTIVE_DASHBOARD.md)  
**Tous les sprints du workflow enrichi sont maintenant documentés ! 🎉**

---

## 📚 Vue d'Ensemble Tous les Sprints

1. ✅ [Sprint 1 - Recherche Web + SWOT](./SPRINT_1_RECHERCHE_WEB_SWOT.md)
2. ✅ [Sprint 2 - Psychologie](./SPRINT_2_PSYCHOLOGIE.md)
3. ✅ [Sprint 3 - Strategic Planning](./SPRINT_3_STRATEGIC_PLANNING.md)
4. ✅ [Sprint 4 - Roadmap Visuelle](./SPRINT_4_ROADMAP_VISUELLE.md) ⭐ CŒUR
5. ✅ [Sprint 5 - Interactive Dashboard](./SPRINT_5_INTERACTIVE_DASHBOARD.md)
6. ✅ [Sprint 6 - Accompagnement Intelligent](./SPRINT_6_ACCOMPAGNEMENT_INTELLIGENT.md)

