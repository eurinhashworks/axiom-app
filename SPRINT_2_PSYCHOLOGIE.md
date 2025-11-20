# 🧘 Sprint 2 : Dimension Psychologique

## 📋 Objectif

Ajouter l'analyse motivationnelle et émotionnelle, identifier les barrières psychologiques, et créer une stratégie d'encouragement personnalisée pour chaque utilisateur.

---

## ✅ Tâches Backend

### 1. Étendre Service Gemini
- [ ] Modifier `backend/src/services/gemini/gemini.service.ts`
  - [ ] Ajouter fonction `analyzePsychologicalFactors(idea: Idea, userProfile?: UserProfile)`
  - [ ] Analyser motivation, impact émotionnel, niveau de confiance
  - [ ] Identifier barrières psychologiques
  - [ ] Générer stratégie d'encouragement

### 2. Types et Interfaces
- [ ] Modifier `backend/src/types/shared.ts`
  - [ ] Interface `PsychologicalAnalysis` :
    ```typescript
    interface PsychologicalAnalysis {
      motivationFactors: MotivationFactor[];
      emotionalImpact: EmotionalImpact;
      confidenceLevel: ConfidenceAssessment;
      psychologicalBarriers: PsychologicalBarrier[];
      encouragementStrategy: EncouragementPlan;
    }
    ```
  - [ ] Interface `MotivationFactor` :
    ```typescript
    interface MotivationFactor {
      type: 'intrinsic' | 'extrinsic' | 'achievement' | 'autonomy' | 'purpose';
      description: string;
      strength: number; // 1-10
      impact: 'high' | 'medium' | 'low';
    }
    ```
  - [ ] Interface `EmotionalImpact` :
    ```typescript
    interface EmotionalImpact {
      excitement: number; // 1-10
      anxiety: number; // 1-10
      confidence: number; // 1-10
      overwhelm: number; // 1-10
      overall: 'positive' | 'neutral' | 'negative';
      recommendations: string[];
    }
    ```
  - [ ] Interface `ConfidenceAssessment` :
    ```typescript
    interface ConfidenceAssessment {
      level: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
      score: number; // 0-100
      factors: string[];
      suggestions: string[];
    }
    ```
  - [ ] Interface `PsychologicalBarrier` :
    ```typescript
    interface PsychologicalBarrier {
      type: 'fear-of-failure' | 'impostor-syndrome' | 'perfectionism' | 'procrastination' | 'self-doubt' | 'overwhelm';
      description: string;
      severity: 'low' | 'medium' | 'high';
      mitigationStrategies: string[];
    }
    ```
  - [ ] Interface `EncouragementPlan` :
    ```typescript
    interface EncouragementPlan {
      messages: EncouragementMessage[];
      milestones: Milestone[];
      motivationalTriggers: string[];
      celebrationMoments: string[];
    }
    ```

### 3. Route Backend
- [ ] Modifier `backend/src/routes/analysis.routes.ts`
  - [ ] Étendre route `POST /api/v1/analysis/analyze`
  - [ ] Inclure analyse psychologique dans la réponse
  - [ ] Utiliser `userProfile` si disponible (passé via token)

---

## ✅ Tâches Frontend

### 4. Types Frontend
- [ ] Modifier `types.ts`
  - [ ] Ajouter toutes les interfaces psychologiques
  - [ ] Étendre `Idea` :
    ```typescript
    interface Idea {
      // ... existant
      psychologicalAnalysis?: PsychologicalAnalysis;
    }
    ```

### 5. Composants UI

#### 5.1 PsychologicalAnalysisView
- [ ] Créer `components/session/PsychologicalAnalysisView.tsx`
  - [ ] Affichage analyse motivationnelle (cartes avec icônes)
  - [ ] Graphique radar pour impact émotionnel (excitation, anxiété, confiance, etc.)
  - [ ] Liste barrières psychologiques avec suggestions
  - [ ] Niveau de confiance avec barre de progression

#### 5.2 EncouragementWidget
- [ ] Créer `components/session/EncouragementWidget.tsx`
  - [ ] Messages motivationnels contextuels
  - [ ] Affichage selon étape du projet
  - [ ] Animations subtiles pour célébrations
  - [ ] Suggestions personnalisées basées sur profil utilisateur

#### 5.3 MotivationFactorsCard
- [ ] Créer `components/session/MotivationFactorsCard.tsx`
  - [ ] Grille des facteurs de motivation
  - [ ] Badges colorés par type (intrinsèque, extrinsèque, etc.)
  - [ ] Scores visuels (barres ou étoiles)

#### 5.4 BarriersView
- [ ] Créer `components/session/BarriersView.tsx`
  - [ ] Liste des barrières détectées
  - [ ] Stratégies de mitigation
  - [ ] Actions concrètes pour chaque barrière

### 6. Intégration dans SessionPage
- [ ] Modifier `components/session/AnalysisComplete.tsx`
  - [ ] Ajouter onglet/section "Analyse Psychologique"
  - [ ] Afficher `PsychologicalAnalysisView`
  - [ ] Intégrer `EncouragementWidget` dans la sidebar

### 7. Messages Contextuels
- [ ] Créer `utils/encouragementMessages.ts`
  - [ ] Fonction `getEncouragementMessage(idea, userProfile)`
  - [ ] Messages selon statut idée (DRAFT, ANALYZED, EVALUATED, etc.)
  - [ ] Messages selon scores (faibles → encouragement, élevés → célébration)

---

## 📦 Dépendances

### Packages Frontend
```json
{
  "recharts": "^2.10.0" // Pour graphique radar impact émotionnel
}
```

---

## ✅ Critères de Succès

- [ ] Analyse psychologique générée pour chaque idée
- [ ] Barrières psychologiques identifiées et suggérées
- [ ] Messages d'encouragement contextuels affichés
- [ ] Widget d'encouragement visible dans l'interface
- [ ] Graphiques impact émotionnel fonctionnels
- [ ] Personnalisation selon profil utilisateur
- [ ] Pas d'erreurs dans les logs

---

## 🎨 Design Guidelines

- **Couleurs motivationnelles :** Vert (positif), Jaune (attention), Bleu (calme)
- **Tone :** Empathique, encourageant, jamais condescendant
- **Animations :** Subtiles, pas intrusives
- **Messages :** Personnels, spécifiques à l'idée, pas génériques

---

## 📝 Notes Techniques

- **Privacy :** Analyse psychologique stockée uniquement côté utilisateur
- **Personnalisation :** Utiliser `userProfile` si disponible pour adapter messages
- **Éthique :** Éviter manipulation, favoriser autonomie et choix éclairé
- **Performance :** Analyse psychologique peut être optionnelle (toggle dans settings)

---

## 🎯 Priorité : MOYENNE

**Durée estimée :** 1 semaine  
**Complexité :** Moyenne

---

**Sprint précédent :** [Sprint 1 - Recherche Web + SWOT](./SPRINT_1_RECHERCHE_WEB_SWOT.md)  
**Prochain Sprint :** [Sprint 3 - Strategic Planning Enrichi](./SPRINT_3_STRATEGIC_PLANNING.md)

