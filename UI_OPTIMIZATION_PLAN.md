# 🚀 Plan d'Optimisation UI

## Problèmes Identifiés

1. **Re-renders inutiles** : Peu de composants utilisent `React.memo`
2. **Pas de lazy loading** : Composants lourds chargés immédiatement (ReactFlow, GraphView)
3. **State management** : DashboardPage trop chargé avec beaucoup de state
4. **Animations CSS** : Nombreuses animations mais pas optimisées pour performance
5. **Code splitting** : Pas de lazy loading des routes/pages

## Solutions

### 1. React.memo pour éviter re-renders
- IdeaCard, IdeaCardEnhanced
- StatusBadge
- Card, Button, Spinner
- Tous les composants de visualisation (SWOT, Go/No-Go, etc.)

### 2. Lazy Loading
- ReactFlow (RoadmapMindmapView)
- GraphView
- Modals (ExportModal, etc.)

### 3. useMemo / useCallback
- DashboardPage : filtrer/trier
- Composants avec calculs coûteux

### 4. Optimisation Animations
- Utiliser `will-change` pour les animations
- Réduire le nombre d'animations simultanées
- Utiliser `transform` et `opacity` au lieu de propriétés coûteuses

### 5. Code Splitting
- Pages avec React.lazy
- Composants lourds avec Suspense

