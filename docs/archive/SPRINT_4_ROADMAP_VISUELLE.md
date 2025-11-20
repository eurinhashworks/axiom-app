# 🗺️ Sprint 4 : Guided Steps + Roadmap Visuelle Interactive

## 📋 Objectif

Créer une roadmap visuelle interactive (style roadmap.sh) avec guidance psychologique à chaque étape, permettant zoom, pan, click et navigation fluide.

---

## ✅ Tâches Backend

### 1. Étendre Guided Steps
- [ ] Modifier `backend/src/services/gemini/gemini.service.ts`
  - [ ] Modifier `generateRoadmap(idea: Idea)` pour inclure guidance psychologique
  - [ ] Ajouter champs psychologiques à chaque étape :
    ```typescript
    interface GuidedStep {
      // Existant
      text: string;
      order: number;
      
      // Nouveau
      psychological: {
        motivation: string;
        emotionalPreparation: string;
        potentialChallenges: string[];
        encouragement: string;
        celebration?: string;
      };
      visual: {
        color: string;
        icon?: string;
        position?: { x: number; y: number };
        connections?: string[]; // IDs étapes précédentes
      };
    }
    ```

### 2. Structure Roadmap Visuelle
- [ ] Modifier `backend/src/types/shared.ts`
  - [ ] Interface `VisualRoadmap` :
    ```typescript
    interface VisualRoadmap {
      id: string;
      ideaId: string;
      layout: 'timeline' | 'flow' | 'gantt' | 'kanban';
      nodes: RoadmapNode[];
      connections: RoadmapConnection[];
      phases: VisualPhase[];
      style: RoadmapStyle;
    }
    ```
  - [ ] Interface `RoadmapNode` :
    ```typescript
    interface RoadmapNode {
      id: string;
      stepId: string;
      label: string;
      type: 'validation' | 'build' | 'test' | 'launch';
      status: 'pending' | 'in-progress' | 'completed' | 'blocked';
      position: { x: number; y: number };
      color: string;
      icon?: string;
      details: GuidedStep;
    }
    ```

---

## ✅ Tâches Frontend

### 3. Installation Librairie
- [ ] Installer React Flow
  ```bash
  npm install reactflow
  ```
  - Alternative : D3.js si préféré
  - React Flow recommandé pour facilité d'utilisation

### 4. Composants UI

#### 4.1 VisualRoadmapCanvas (Principal)
- [ ] Créer `components/dashboard/VisualRoadmapCanvas.tsx`
  - [ ] Canvas interactif avec React Flow
  - [ ] Nœuds colorés selon statut/difficulté
  - [ ] Connexions visuelles (dépendances)
  - [ ] Zoom : Molette souris, boutons +/-, double-click
  - [ ] Pan : Drag canvas, flèches clavier
  - [ ] Click nœud : Modal avec détails étape
  - [ ] Hover : Tooltip avec info rapide
  - [ ] Phases groupées visuellement

#### 4.2 RoadmapNode (Nœud Personnalisé)
- [ ] Créer `components/dashboard/RoadmapNode.tsx`
  - [ ] Composant React Flow personnalisé
  - [ ] Style selon type (validation/build/test/launch)
  - [ ] Badge statut (pending/in-progress/completed)
  - [ ] Icône type étape
  - [ ] Animation au hover
  - [ ] Checkbox pour marquer complet

#### 4.3 RoadmapPhaseGroup
- [ ] Créer `components/dashboard/RoadmapPhaseGroup.tsx`
  - [ ] Groupement visuel par phases
  - [ ] Zone colorée avec titre phase
  - [ ] Collapse/expand phases
  - [ ] Compteur étapes complétées par phase

#### 4.4 RoadmapControls
- [ ] Créer `components/dashboard/RoadmapControls.tsx`
  - [ ] Boutons zoom in/out
  - [ ] Reset view (fit to screen)
  - [ ] Toggle layout (timeline/flow/gantt)
  - [ ] Filtres : Afficher seulement complétées/en cours
  - [ ] Export image (PNG/SVG)

#### 4.5 RoadmapDetailModal
- [ ] Créer `components/dashboard/RoadmapDetailModal.tsx`
  - [ ] Modal avec détails étape complète
  - [ ] Section guidance psychologique
  - [ ] Challenges potentiels
  - [ ] Message d'encouragement
  - [ ] Bouton marquer complété
  - [ ] Navigation précédent/suivant

### 5. Intégration dans SessionPage
- [ ] Modifier `components/session/RoadmapView.tsx` (si existe)
  - [ ] Ajouter toggle liste ↔ graphique
  - [ ] Intégrer `VisualRoadmapCanvas`
  - [ ] Navigation fluide entre vues

### 6. Layouts Disponibles

#### 6.1 Timeline Layout
- [ ] Layout horizontal avec timeline
- [ ] Dates/ordres d'exécution
- [ ] Barres de progression

#### 6.2 Flow Layout
- [ ] Layout organique avec connexions
- [ ] Auto-positionnement intelligent
- [ ] Chemins visuels clairs

#### 6.3 Gantt Layout
- [ ] Vue calendrier classique
- [ ] Durées estimées par étape
- [ ] Jalons (milestones)

#### 6.4 Kanban Layout
- [ ] Colonnes par phase/statut
- [ ] Drag & drop entre colonnes
- [ ] Vue agile

---

## 📦 Dépendances

### Packages Frontend
```json
{
  "reactflow": "^11.10.0",
  "@reactflow/core": "^11.10.0",
  "@reactflow/controls": "^11.2.0"
}
```

---

## ✅ Critères de Succès

- [ ] Roadmap visuelle interactive fonctionnelle
- [ ] Zoom et pan opérationnels
- [ ] Click nœud → Modal détails
- [ ] Guidance psychologique visible dans détails
- [ ] Navigation liste ↔ graphique fluide
- [ ] Mise à jour temps réel statut étapes
- [ ] Export image fonctionnel
- [ ] Performances acceptables (≥60 FPS)

---

## 🎨 Design Guidelines

- **Couleurs :**
  - Validation : Bleu clair
  - Build : Vert
  - Test : Orange
  - Launch : Violet
- **Taille nœuds :** Adaptative selon zoom
- **Connexions :** Flèches avec labels (dépendances)
- **Animations :** Subtiles, fluides

---

## 📝 Notes Techniques

- **Performance :** Limiter nombre de nœuds visibles simultanément (virtualisation si >50)
- **Sauvegarde position :** Stocker positions nœuds dans Firestore pour persistance
- **Responsive :** Adapter layout mobile/desktop
- **Accessibilité :** Navigation clavier, ARIA labels

---

## 🎯 Priorité : HAUTE (CŒUR DU PRODUIT)

**Durée estimée :** 2-3 semaines  
**Complexité :** Élevée

---

**Sprint précédent :** [Sprint 3 - Strategic Planning](./SPRINT_3_STRATEGIC_PLANNING.md)  
**Prochain Sprint :** [Sprint 5 - Interactive Dashboard](./SPRINT_5_INTERACTIVE_DASHBOARD.md)

