# Documentation des Composants - AXIOM

## Vue d'ensemble

Cette documentation décrit tous les composants React utilisés dans AXIOM, leur structure, leurs props et leur utilisation.

## Structure des composants

```
components/
├── auth/                    # Authentification
│   ├── Login.tsx
│   └── WelcomePage.tsx
├── dashboard/               # Tableau de bord
│   ├── ActivityFeedItem.tsx
│   ├── GraphView.tsx
│   ├── IdeaCard.tsx
│   ├── NewIdeaModal.tsx
│   ├── PrioritizationResultModal.tsx
│   ├── StatusBadge.tsx
│   └── WorkspaceSwitcher.tsx
├── layout/                  # Mise en page
│   ├── AppHeader.tsx
│   └── SimpleHeader.tsx
├── session/                 # Sessions d'analyse
│   ├── AnalysisComplete.tsx
│   ├── AnalysisCompleteMessage.tsx
│   ├── AnalysisInProgress.tsx
│   ├── AnalysisSkeleton.tsx
│   ├── AnalysisView.tsx
│   ├── EvaluationView.tsx
│   ├── ExportModal.tsx
│   ├── InputSelection.tsx
│   ├── RoadmapView.tsx
│   └── SessionSidebar.tsx
├── ui/                      # Composants UI de base
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Spinner.tsx
├── AxiomFlow.tsx            # Composant principal
├── ChatBot.tsx
└── LiveConversation.tsx
```

## Composants principaux

### `AxiomFlow.tsx`

Composant principal qui orchestre le flux de l'application.

**Props :** Aucune

**Fonctionnalités :**
- Gestion de l'état global de l'application
- Navigation entre les différentes vues
- Intégration des contextes

**Utilisation :**
```tsx
import AxiomFlow from './components/AxiomFlow';

function App() {
    return <AxiomFlow />;
}
```

### `AxiomFlow.tsx` (dans components/)

Version alternative du composant principal.

## Composants de session

### `AnalysisView.tsx`

Affiche l'analyse d'une idée générée par l'IA.

**Props :**
```typescript
interface AnalysisViewProps {
    idea: Idea;
    onNext: () => void;
}
```

**Fonctionnalités :**
- Affichage du résumé de l'idée
- Liste des questions de clarification
- Liste des risques potentiels
- Bouton pour passer à l'évaluation

### `EvaluationView.tsx`

Affiche l'évaluation d'une idée avec les scores détaillés.

**Props :**
```typescript
interface EvaluationViewProps {
    idea: Idea;
    onNext: () => void;
    onBack: () => void;
}
```

**Fonctionnalités :**
- Affichage des 5 scores d'évaluation
- Calcul et affichage des scores d'opportunité et de faisabilité
- Visualisation des scores avec des barres de progression
- Navigation vers la feuille de route

### `RoadmapView.tsx`

Affiche la feuille de route générée pour une idée.

**Props :**
```typescript
interface RoadmapViewProps {
    idea: Idea;
    onBack: () => void;
    onComplete: () => void;
}
```

**Fonctionnalités :**
- Affichage des étapes de la feuille de route
- Checklist interactive pour marquer les étapes comme terminées
- Persistance de l'état des étapes
- Boutons de navigation

### `SessionSidebar.tsx`

Barre latérale pour la navigation dans une session.

**Props :**
```typescript
interface SessionSidebarProps {
    currentStep: string;
    onStepChange: (step: string) => void;
    idea: Idea;
}
```

**Fonctionnalités :**
- Navigation entre les étapes de la session
- Indicateur de progression
- Informations sur l'idée courante

## Composants du tableau de bord

### `IdeaCard.tsx`

Carte affichant une idée dans le tableau de bord.

**Props :**
```typescript
interface IdeaCardProps {
    idea: Idea;
    onSelect: (idea: Idea) => void;
    onDelete: (id: string) => void;
}
```

**Fonctionnalités :**
- Affichage des informations de base de l'idée
- Scores d'opportunité et de faisabilité
- Badge de statut
- Actions (sélectionner, supprimer)

### `GraphView.tsx`

Vue graphique de type matrice BCG pour visualiser les idées.

**Props :**
```typescript
interface GraphViewProps {
    ideas: Idea[];
    onIdeaSelect: (idea: Idea) => void;
}
```

**Fonctionnalités :**
- Positionnement des idées sur l'axe Opportunité vs Faisabilité
- Interaction avec les points pour sélectionner une idée
- Légende et axes étiquetés

### `NewIdeaModal.tsx`

Modal pour créer une nouvelle idée.

**Props :**
```typescript
interface NewIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onIdeaCreate: (title: string) => void;
}
```

**Fonctionnalités :**
- Formulaire de saisie du titre
- Validation de la saisie
- Création de l'idée

### `PrioritizationResultModal.tsx`

Modal affichant les résultats de la priorisation par l'IA.

**Props :**
```typescript
interface PrioritizationResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: string;
}
```

**Fonctionnalités :**
- Affichage de l'analyse de priorisation en Markdown
- Bouton de fermeture
- Formatage du contenu

## Composants UI de base

### `Button.tsx`

Composant bouton réutilisable.

**Props :**
```typescript
interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}
```

**Variantes :**
- `primary` : Bouton principal (bleu)
- `secondary` : Bouton secondaire (gris)
- `danger` : Bouton de danger (rouge)

### `Card.tsx`

Composant carte réutilisable.

**Props :**
```typescript
interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}
```

**Fonctionnalités :**
- Style de carte avec ombre
- Support du hover
- Support du clic

### `Spinner.tsx`

Composant de chargement.

**Props :**
```typescript
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
```

## Composants d'état

### `AnalysisInProgress.tsx`

Affichage pendant l'analyse d'une idée.

**Props :**
```typescript
interface AnalysisInProgressProps {
    idea: Idea;
}
```

**Fonctionnalités :**
- Animation de chargement
- Message d'encouragement
- Indicateur de progression

### `AnalysisSkeleton.tsx`

Skeleton loader pour l'analyse.

**Props :** Aucune

**Fonctionnalités :**
- Animation de skeleton
- Placeholder pour le contenu de l'analyse

### `AnalysisComplete.tsx`

Affichage de l'analyse terminée.

**Props :**
```typescript
interface AnalysisCompleteProps {
    idea: Idea;
    onNext: () => void;
}
```

## Composants de mise en page

### `SimpleHeader.tsx`

En-tête simple de l'application.

**Props :** Aucune

**Fonctionnalités :**
- Logo/titre de l'application
- Navigation simple

### `AppHeader.tsx`

En-tête principal de l'application.

**Props :**
```typescript
interface AppHeaderProps {
    onMenuToggle?: () => void;
    user?: User;
}
```

## Hooks personnalisés

### `useIdeas`

Hook pour gérer les idées.

```typescript
const {
    ideas,
    addIdea,
    updateIdea,
    deleteIdea,
    activeIdea,
    setActiveIdea
} = useIdeas();
```

### `useLocalStorage`

Hook pour la persistance locale.

```typescript
const [value, setValue] = useLocalStorage<T>('key', defaultValue);
```

### `useLiveSession`

Hook pour gérer les sessions en temps réel.

```typescript
const {
    currentStep,
    setCurrentStep,
    isAnalyzing,
    isEvaluating
} = useLiveSession(idea);
```

## Contextes

### `IdeasContext`

Contexte global pour la gestion des idées.

```typescript
interface IdeasContextType {
    ideas: Idea[];
    addIdea: (title: string) => Idea;
    updateIdea: (id: string, updates: Partial<Idea>) => void;
    deleteIdea: (id: string) => void;
    activeIdea: Idea | null;
    setActiveIdea: (idea: Idea | null) => void;
}
```

### `AuthContext`

Contexte pour l'authentification (placeholder).

### `WorkspaceContext`

Contexte pour les espaces de travail (placeholder).

## Exemples d'utilisation

### Création d'une nouvelle idée

```tsx
import { useIdeas } from '../contexts/IdeasContext';
import NewIdeaModal from '../components/dashboard/NewIdeaModal';

function Dashboard() {
    const { addIdea } = useIdeas();
    const [showModal, setShowModal] = useState(false);

    const handleIdeaCreate = (title: string) => {
        addIdea(title);
        setShowModal(false);
    };

    return (
        <>
            <button onClick={() => setShowModal(true)}>
                Nouvelle idée
            </button>
            <NewIdeaModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onIdeaCreate={handleIdeaCreate}
            />
        </>
    );
}
```

### Affichage d'une analyse

```tsx
import AnalysisView from '../components/session/AnalysisView';

function SessionPage() {
    const { activeIdea } = useIdeas();
    const [currentStep, setCurrentStep] = useState('analysis');

    if (!activeIdea) return <div>Aucune idée sélectionnée</div>;

    return (
        <AnalysisView
            idea={activeIdea}
            onNext={() => setCurrentStep('evaluation')}
        />
    );
}
```

## Bonnes pratiques

1. **Props typées** : Toujours typer les props avec TypeScript
2. **Composants purs** : Éviter les effets de bord dans les composants de présentation
3. **Séparation des responsabilités** : Un composant = une responsabilité
4. **Réutilisabilité** : Créer des composants génériques quand possible
5. **Accessibilité** : Utiliser les attributs ARIA appropriés
6. **Performance** : Utiliser React.memo pour les composants coûteux
