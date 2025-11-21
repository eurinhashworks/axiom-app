import { GoogleGenAI } from "@google/genai";
import { Idea, IdeaAnalysis, IdeaEvaluation, ClarifyingQuestionAnswer } from "../../types/shared.js";

// Configuration simple
const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-pro';

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
  throw new Error("Clé API Gemini manquante. Veuillez définir API_KEY ou GEMINI_API_KEY dans les variables d'environnement.");
}

// Initialize the Google Gemini API client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Timeout pour les appels API
const TIMEOUT = parseInt(process.env.GEMINI_TIMEOUT || '30000', 10); // 30s par défaut

/**
 * Crée une promesse avec timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("L'appel à l'API Gemini a expiré")), timeoutMs);
    }),
  ]);
}

/**
 * Valide qu'un score est dans la plage 1-10
 */
function validateScore(score: number, fieldName: string): void {
  if (typeof score !== 'number' || isNaN(score)) {
    throw new Error(`${fieldName} doit être un nombre valide`);
  }
  if (score < 1 || score > 10) {
    throw new Error(`${fieldName} doit être entre 1 et 10, reçu: ${score}`);
  }
}

/**
 * Valide qu'un tableau n'est pas vide et contient des chaînes
 */
function validateStringArray(arr: any[], fieldName: string, minLength: number = 1): void {
  if (!Array.isArray(arr)) {
    throw new Error(`${fieldName} doit être un tableau`);
  }
  if (arr.length < minLength) {
    throw new Error(`${fieldName} doit contenir au moins ${minLength} élément(s)`);
  }
  if (!arr.every(item => typeof item === 'string' && item.trim().length > 0)) {
    throw new Error(`${fieldName} doit contenir uniquement des chaînes non vides`);
  }
}

/**
 * Échappe les caractères spéciaux dans les chaînes pour éviter les injections de prompt
 */
export function escapePromptInput(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

/**
 * Helper générique pour les appels API avec schema JSON
 */
interface GenerateContentWithSchemaOptions {
  prompt: string;
  schema: any;
}

export async function generateContentWithSchema<T>(
  options: GenerateContentWithSchemaOptions
): Promise<T> {
  const { prompt, schema } = options;
  
  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Le prompt ne peut pas être vide");
  }

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
      TIMEOUT
    );

    const jsonText = response.text?.trim();

    if (!jsonText) {
      throw new Error("La réponse de l'API est vide");
    }

    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error("La réponse parsée est invalide");
    }

    return parsed as T;
  } catch (error) {
    console.error('Erreur lors de l\'appel à Gemini:', error);
    throw error;
  }
}

// Schémas pour les validations
const clarifyingQuestionSchema = {
  type: 'object',
  properties: {
    question: {
      type: 'string',
      description: "Question critique qui challenge une hypothèse fondamentale de l'idée"
    },
    options: {
      type: 'array',
      description: "3-4 options de réponse réalistes et distinctes qui couvrent différents scénarios",
      items: { type: 'string' }
    },
    explanation: {
      type: 'string',
      description: "Explication courte (1 phrase) de pourquoi cette question est importante"
    }
  },
  required: ["question", "options"]
};

const analysisSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: "Un résumé neutre et factuel de l'idée principale, sans biais positif ou négatif. Extrayez uniquement ce qui est explicitement énoncé dans le brain dump, sans ajouter d'interprétation optimiste. Doit faire 1-3 phrases.",
    },
    clarifyingQuestions: {
      type: 'array',
      description: "Une liste de 3-5 questions à choix multiples critiques qui challengent les hypothèses implicites. Chaque question doit avoir 3-4 options réalistes couvrant différents scénarios (validation marché, différenciation réelle, modèle économique, barrières à l'entrée).",
      items: clarifyingQuestionSchema
    },
    potentialRisks: {
      type: 'array',
      description: "Une liste de 3-5 risques concrets et spécifiques, pas génériques. Chaque risque doit être directement lié à l'idée présentée et basé sur des faits observables, pas sur des spéculations. Considérez les risques de marché, techniques, réglementaires, concurrentiels et d'exécution.",
      items: { type: 'string' }
    },
  },
  required: ["summary", "clarifyingQuestions", "potentialRisks"],
};

export async function analyzeBrainDump(brainDump: string): Promise<IdeaAnalysis> {
  // Validation de l'entrée
  if (!brainDump || typeof brainDump !== 'string') {
    throw new Error("Le brain dump est requis et doit être une chaîne de caractères");
  }

  const trimmedBrainDump = brainDump.trim();
  if (trimmedBrainDump.length < 10) {
    throw new Error("Le brain dump doit contenir au moins 10 caractères pour être analysé");
  }

  if (trimmedBrainDump.length > 10000) {
    throw new Error("Le brain dump est trop long (maximum 10000 caractères)");
  }

  const escapedBrainDump = escapePromptInput(trimmedBrainDump);

  const prompt = `Vous êtes un analyste critique et objectif spécialisé dans l'évaluation d'idées d'entreprise en phase d'idéation. Votre rôle est de fournir une analyse honnête et non biaisée, en évitant l'optimisme excessif comme le pessimisme injustifié.

**Principes d'analyse :**
- Restez factuel : basez-vous uniquement sur ce qui est énoncé, évitez les suppositions optimistes
- Pensez critique : identifiez les hypothèses implicites non validées
- Considérez les perspectives alternatives : qu'est-ce qui pourrait invalider cette idée ?
- Évitez les biais de confirmation : ne cherchez pas à valider l'idée mais à la challenger
- Soyez constructif : critiquez les faiblesses mais proposez des axes d'amélioration

**Brain Dump à analyser :**
---
${escapedBrainDump}
---

**Instructions spécifiques :**
1. Résumé : Synthétisez l'idée telle qu'elle est décrite, sans ajouter de promesses ou de bénéfices non mentionnés. Restez neutre.
2. Questions de clarification : Posez des questions qui révèlent les angles morts critiques. Évitez les questions "douces" qui présupposent que l'idée est bonne. Chaque question doit tester une hypothèse fondamentale.
3. Risques potentiels : Identifiez des risques spécifiques et concrets basés sur ce qui est décrit. Évitez les risques génériques comme "concurrence" sans contexte. Expliquez pourquoi chaque risque est pertinent pour cette idée précise.

Fournissez votre analyse au format JSON spécifié.`;

  const result = await generateContentWithSchema<IdeaAnalysis>({
    prompt,
    schema: analysisSchema,
  });

  // Validation de la réponse
  if (!result.summary || typeof result.summary !== 'string' || result.summary.trim().length === 0) {
    throw new Error("Le résumé de l'analyse est invalide ou vide");
  }

  // Valider les questions de clarification (nouveau format avec choix multiples)
  if (!Array.isArray(result.clarifyingQuestions) || result.clarifyingQuestions.length < 3) {
    throw new Error("clarifyingQuestions doit être un tableau avec au moins 3 questions");
  }

  // Vérifier que chaque question a des options
  for (const q of result.clarifyingQuestions) {
    if (typeof q === 'string') continue; // Support ancien format
    if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 3) {
      throw new Error("Chaque question doit avoir au moins 3 options de réponse");
    }
  }

  validateStringArray(result.potentialRisks, "potentialRisks", 3);

  return result;
}

const techRecommendationSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      description: "Catégorie : 'Frontend', 'Backend', 'Database', 'Infrastructure', 'Tooling', 'Deployment'"
    },
    name: {
      type: 'string',
      description: "Nom de la technologie recommandée (ex: React, Node.js, PostgreSQL, AWS)"
    },
    reason: {
      type: 'string',
      description: "Explication courte (1-2 phrases) de pourquoi cette technologie est adaptée pour cette idée"
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      description: "Complexité d'apprentissage et d'implémentation"
    }
  },
  required: ["category", "name", "reason", "difficulty"]
};

const evaluationSchema = {
  type: 'object',
  properties: {
    problemUrgency: {
      type: 'number',
      description: "Score (1-10) pour l'urgence et la douleur réelle du problème pour le public cible. Basez-vous sur des preuves, pas sur des affirmations. 1 = problème inexistant ou négligeable, 5 = problème modéré mais gérable, 10 = problème critique non résolu causant des coûts significatifs. Évitez le biais d'optimisme : un problème 'intéressant' ne vaut pas forcément 8/10.",
    },
    targetMarketSize: {
      type: 'number',
      description: "Score (1-10) pour la taille réelle et l'accessibilité du marché cible, basé sur des données vérifiables. 1 = niche <1000 personnes, marché inaccessible ou déclinant, 5 = marché de taille moyenne et atteignable, 10 = marché >10M personnes, en croissance, avec des canaux d'acquisition clairs. Considérez le TAM réel, pas le TAM théorique.",
    },
    competitiveAdvantage: {
      type: 'number',
      description: "Score (1-10) pour un avantage concurrentiel réellement défendable et différentiateur. 1 = commodité facilement copiable, 5 = différenciation modérée mais fragile, 10 = avantage structurel durable (ex: brevet, réseau effectif, données exclusives). Évitez de surévaluer les 'différences' qui ne sont pas des avantages réels.",
    },
    personalAlignment: {
      type: 'number',
      description: "Score (1-10) pour l'alignement objectif entre l'idée et les compétences démontrées, passions authentiques et ressources disponibles du fondateur. 1 = décalage majeur (fondateur sans expérience pertinente ni ressources), ... 5 = alignement modéré, 10 = parfait alignement avec expertise démontrée et ressources disponibles.",
    },
    technicalFeasibility: {
      type: 'number',
      description: "Score (1-10) pour la faisabilité technique réelle d'un MVP fonctionnel. 1 = nécessite des avancées technologiques majeures ou des ressources massives, 5 = complexe mais faisable avec une équipe compétente, 10 = MVP simple avec des outils existants, réalisable rapidement. Considérez ce qui est prouvé techniquement possible, pas ce qui est théoriquement envisageable.",
    },
    recommendedTechnologies: {
      type: 'array',
      description: "Liste de 4-6 technologies recommandées pour construire le MVP, incluant frontend, backend, et outils. Adaptez aux besoins spécifiques de l'idée.",
      items: techRecommendationSchema
    },
    recommendedDatabases: {
      type: 'array',
      description: "Liste de 1-3 bases de données recommandées selon les besoins (relationnel, NoSQL, temps réel, etc.). Justifiez chaque choix.",
      items: techRecommendationSchema
    },
  },
  required: ["problemUrgency", "targetMarketSize", "competitiveAdvantage", "personalAlignment", "technicalFeasibility"],
};

export async function evaluateIdea(idea: Idea): Promise<IdeaEvaluation> {
  // Validation de l'entrée
  if (!idea) {
    throw new Error("L'idée est requise");
  }

  if (!idea.title || typeof idea.title !== 'string' || idea.title.trim().length === 0) {
    throw new Error("Le titre de l'idée est requis");
  }

  if (!idea.analysis) {
    throw new Error("L'idée doit avoir une analyse avant d'être évaluée");
  }

  if (!idea.analysis.summary || typeof idea.analysis.summary !== 'string') {
    throw new Error("L'analyse doit contenir un résumé");
  }

  if (!idea.analysis.clarifyingQuestions || !Array.isArray(idea.analysis.clarifyingQuestions) || idea.analysis.clarifyingQuestions.length === 0) {
    throw new Error("L'analyse doit contenir au moins une question de clarification");
  }

  if (!idea.analysis.potentialRisks || !Array.isArray(idea.analysis.potentialRisks) || idea.analysis.potentialRisks.length === 0) {
    throw new Error("L'analyse doit contenir au moins un risque potentiel");
  }

  const escapedTitle = escapePromptInput(idea.title.trim());
  const escapedSummary = escapePromptInput(idea.analysis.summary);

  // Extraire les questions (format nouveau ou ancien)
  const questionsForPrompt = idea.analysis.clarifyingQuestions.map((q: any) => {
    if (typeof q === 'string') return q;
    return q.question;
  });
  const escapedQuestions = questionsForPrompt.map(q => escapePromptInput(q));

  const escapedRisks = idea.analysis.potentialRisks.map(r => escapePromptInput(r));

  const prompt = `Vous êtes un investisseur en venture capital expérimenté qui évalue une idée de startup. Votre objectif est de fournir une évaluation objective, rigoureuse et non biaisée.

**Règles d'évaluation strictes :**
- Utilisez une distribution réaliste : la plupart des idées obtiennent 4-6/10, pas 7-9/10
- Basez chaque score sur des preuves et des faits observables, pas sur des promesses ou des intentions
- Considérez les alternatives : pour chaque point positif, cherchez les contre-arguments
- Évitez le biais d'ancrage : n'acceptez pas les affirmations sans les challenger
- Appliquez le principe de parcimonie : en cas de doute, pénalisez plutôt que surévaluer
- Considérez les risques identifiés : ils doivent influencer négativement vos scores si non adressés

**Contexte de l'idée :**

Titre : ${escapedTitle}

Résumé du concept :
${escapedSummary}

Questions critiques soulevées (à utiliser pour identifier les faiblesses) :
${Array.isArray(idea.analysis.clarifyingQuestions) && idea.analysis.clarifyingQuestions[0] && typeof idea.analysis.clarifyingQuestions[0] === 'object'
    ? idea.analysis.clarifyingQuestions.map((q: any, i: number) => \`- \${i + 1}. \${q.question} (Réponse choisie: \${idea.clarifyingAnswers?.find((a: ClarifyingQuestionAnswer) => a.questionIndex === i)?.selectedOption || 'Non répondue'})\`).join('\n')
    : escapedQuestions.map((q, i) => \`- \${i + 1}. \${q}\`).join('\n')}

Risques identifiés (à considérer dans votre évaluation) :
- \${escapedRisks.join('\n- ')}

**Instructions par critère :**

1. **Problem Urgency** : Y a-t-il des preuves que ce problème existe vraiment et cause de la douleur mesurable ? Combien de personnes sont réellement affectées ? Quelle est la fréquence et l'intensité de la douleur ?

2. **Target Market Size** : Quelle est la taille réelle du marché adressable (SAM), pas théorique (TAM) ? Le marché est-il accessible sans budgets marketing massifs ? Existe-t-il des canaux d'acquisition clairs et économiques ?

3. **Competitive Advantage** : Quelle est la vraie barrière à l'entrée ? Combien de temps avant qu'un concurrent puisse copier ? Y a-t-il un avantage structurel durable ou juste une exécution différente ?

4. **Personal Alignment** : Y a-t-il des preuves que le fondateur a l'expertise nécessaire ? Les ressources (temps, capital, réseau) sont-elles réellement disponibles ? L'alignement est-il authentique ou théorique ?

5. **Technical Feasibility** : Un MVP fonctionnel peut-il être construit rapidement avec des ressources limitées ? Y a-t-il des dépendances technologiques risquées ? La complexité est-elle sous-estimée ?

**Recommandations technologiques :**
Basé sur l'idée, recommandez des technologies concrètes pour :
- Frontend (framework, bibliothèques UI)
- Backend (langage, framework, API)
- Bases de données (type, choix spécifique)
- Infrastructure (hébergement, déploiement)
- Outils (CI/CD, monitoring, etc.)

Adaptez vos recommandations à la complexité technique identifiée et à la faisabilité. Pour un MVP simple, privilégiez des technologies rapides à apprendre et déployer.

**Distribution attendue :**
- Scores 1-3 : Faiblesses critiques difficiles à surmonter
- Scores 4-6 : Idée viable mais avec des défis significatifs (MAJORITÉ des cas)
- Scores 7-8 : Idée solide avec de bons fondamentaux
- Scores 9-10 : Idée exceptionnelle avec avantages structuraux clairs (RARE)

Fournissez votre évaluation au format JSON avec des scores entiers entre 1 et 10, en justifiant mentalement chaque score avant de le noter.`;

  const result = await generateContentWithSchema<IdeaEvaluation>({
    prompt,
    schema: evaluationSchema,
  });

  // Validation des scores
  validateScore(result.problemUrgency, "problemUrgency");
  validateScore(result.targetMarketSize, "targetMarketSize");
  validateScore(result.competitiveAdvantage, "competitiveAdvantage");
  validateScore(result.personalAlignment, "personalAlignment");
  validateScore(result.technicalFeasibility, "technicalFeasibility");

  return result;
}

const roadmapSchema = {
  type: 'object',
  properties: {
    roadmapSteps: {
      type: 'array',
      description: "Une liste de 5-7 étapes spécifiques, actionnables et mesurables. Les premières étapes doivent TOUJOURS être de validation (tests utilisateurs, validation du problème, tests de volonté de payer). Les étapes de construction ne doivent venir qu'après validation. Chaque étape doit être concrète avec des critères de succès clairs, pas vague comme 'Faire une étude de marché'.",
      items: { type: 'string' }
    },
  },
  required: ["roadmapSteps"],
};

export async function generateRoadmap(idea: Idea): Promise<string[]> {
  // Validation de l'entrée
  if (!idea) {
    throw new Error("L'idée est requise");
  }

  if (!idea.title || typeof idea.title !== 'string' || idea.title.trim().length === 0) {
    throw new Error("Le titre de l'idée est requis");
  }

  if (!idea.analysis?.summary) {
    throw new Error("L'idée doit avoir une analyse avec un résumé avant de générer une feuille de route");
  }

  if (idea.opportunityScore === undefined || idea.feasibilityScore === undefined) {
    throw new Error("L'idée doit avoir des scores d'évaluation avant de générer une feuille de route");
  }

  const escapedTitle = escapePromptInput(idea.title.trim());
  const escapedSummary = escapePromptInput(idea.analysis.summary);
  const opportunityScore = typeof idea.opportunityScore === 'number' ? idea.opportunityScore.toFixed(1) : 'N/A';
  const feasibilityScore = typeof idea.feasibilityScore === 'number' ? idea.feasibilityScore.toFixed(1) : 'N/A';

  const prompt = \`Vous êtes un conseiller en stratégie startup spécialisé dans la validation d'idées et la construction de MVP. Créez une feuille de route réaliste et orientée validation, pas une roadmap optimiste.

**Principe fondamental : VALIDER AVANT DE CONSTRUIRE**

Les scores d'évaluation indiquent des faiblesses potentielles qui doivent être adressées dans la roadmap. Une idée avec des scores faibles doit se concentrer davantage sur la validation que sur la construction.

**Contexte de l'idée :**

Titre : \${escapedTitle}

Résumé du concept :
\${escapedSummary}

Scores d'évaluation :
- Opportunité : \${opportunityScore}/10
- Faisabilité : \${feasibilityScore}/10

**Interprétation des scores :**
- Score < 6 : Prioriser fortement la validation et les tests de risque critique avant construction
- Score 6-7 : Validation importante mais peut commencer un MVP simple en parallèle
- Score > 7 : Plus de flexibilité pour construire, mais validation toujours nécessaire

**Structure de la roadmap :**

1. **Validation du problème** (2-3 étapes) : Tests concrets pour valider que le problème existe réellement et que les gens paieraient pour une solution
   - Interviews utilisateurs structurées
   - Tests de volonté de payer (pré-ventes, landing pages)
   - Validation quantitative du problème

2. **Validation de la solution** (1-2 étapes) : Tests pour valider que votre approche résout réellement le problème
   - Prototypes de basse fidélité testés avec utilisateurs
   - Tests A/B de concepts
   - Validation de l'avantage concurrentiel réel

3. **Construction MVP** (2-3 étapes) : Construction uniquement après validation, et uniquement du strict minimum
   - MVP focussé sur une seule fonctionnalité critique
   - Tests avec utilisateurs réels
   - Itérations basées sur feedback

**Instructions spécifiques :**
- Chaque étape doit être actionnable et mesurable
- Les étapes de validation doivent être concrètes : "Interroger 20 utilisateurs cibles" pas "Comprendre le marché"
- Incluez des critères de succès pour chaque étape
- Adaptez la roadmap aux scores : si les scores sont faibles, augmentez la proportion d'étapes de validation
- Évitez les étapes vagues comme "Faire une étude de marché" - soyez spécifique

Générez une liste de 5-7 étapes dans l'ordre chronologique, en commençant toujours par la validation.\`;

  const result = await generateContentWithSchema<{ roadmapSteps: string[] }>({
    prompt,
    schema: roadmapSchema,
  });

  // Validation de la réponse
  validateStringArray(result.roadmapSteps, "roadmapSteps", 5);

  return result.roadmapSteps;
}

export async function prioritizeIdeas(ideas: Idea[]): Promise<string> {
  // Validation de l'entrée
  if (!ideas || !Array.isArray(ideas)) {
    throw new Error("La liste d'idées est requise et doit être un tableau");
  }

  if (ideas.length === 0) {
    throw new Error("Au moins une idée est requise pour la priorisation");
  }

  if (ideas.length > 20) {
    throw new Error("Trop d'idées à prioriser (maximum 20)");
  }

  // Filtrer et valider les idées évaluées
  const evaluatedIdeas = ideas.filter(idea => {
    return idea.analysis?.summary &&
           idea.opportunityScore !== undefined &&
           idea.feasibilityScore !== undefined &&
           idea.evaluation;
  });

  if (evaluatedIdeas.length === 0) {
    throw new Error("Aucune idée évaluée trouvée. Toutes les idées doivent avoir une analyse et une évaluation complètes");
  }

  const ideaSummaries = evaluatedIdeas.map(idea => {
    const escapedTitle = escapePromptInput(idea.title || 'Sans titre');
    const escapedSummary = escapePromptInput(idea.analysis?.summary || '');
    const opportunityScore = typeof idea.opportunityScore === 'number' ? idea.opportunityScore.toFixed(1) : 'N/A';
    const feasibilityScore = typeof idea.feasibilityScore === 'number' ? idea.feasibilityScore.toFixed(1) : 'N/A';
    const problemUrgency = idea.evaluation?.problemUrgency ?? 'N/A';
    const targetMarketSize = idea.evaluation?.targetMarketSize ?? 'N/A';
    const competitiveAdvantage = idea.evaluation?.competitiveAdvantage ?? 'N/A';
    const personalAlignment = idea.evaluation?.personalAlignment ?? 'N/A';
    const technicalFeasibility = idea.evaluation?.technicalFeasibility ?? 'N/A';

    return \`
---
### \${escapedTitle}
- **Concept :** \${escapedSummary}
- **Score d'Opportunité :** \${opportunityScore}/10 (Urgence: \${problemUrgency}, Taille du marché: \${targetMarketSize}, Avantage: \${competitiveAdvantage})
- **Score de Faisabilité :** \${feasibilityScore}/10 (Alignement: \${personalAlignment}, Technique: \${technicalFeasibility})
---
\`;
  }).join('\n');

  const prompt = \`Vous êtes un investisseur en VC qui doit aider un entrepreneur à prioriser ses idées. Votre objectif est de recommander la meilleure opportunité basée sur une analyse objective et sans biais.

**Principe de priorisation :**
- Une idée avec opportunité élevée mais faisabilité faible peut être meilleure qu'une idée avec scores moyens partout
- La faisabilité est souvent plus importante que l'opportunité pour un fondateur individuel
- Évitez le biais du "tout est bon" : soyez direct sur les idées qui ne valent pas la peine
- Considérez le profil du fondateur : l'alignement personnel est crucial pour la réussite

**Idées à comparer :**

\${ideaSummaries}

**Instructions pour votre analyse :**

1. **Analyse comparative objective** :
   - Comparez les idées sur chaque critère individuellement
   - Identifiez les forces et faiblesses réelles de chaque idée
   - Évitez les phrases génériques : soyez spécifique sur ce qui différencie vraiment les idées

2. **Recommandation claire** :
   - Indiquez explicitement quelle idée prioriser et pourquoi
   - Justifiez basé sur les scores ET sur la cohérence globale (une idée avec scores 7/7/7 peut être meilleure qu'une avec 9/5/5)
   - Considérez le risque : quelle idée a le meilleur ratio risque/récompense ?

3. **Critique constructive des autres idées** :
   - Expliquez pourquoi chaque autre idée n'est pas prioritaire
   - Identifiez les points bloquants spécifiques (pas juste "scores plus faibles")
   - Suggérez si certaines idées doivent être abandonnées ou simplement repoussées

4. **Perspective réaliste** :
   - Ne donnez pas l'impression que toutes les idées sont bonnes
   - Si une idée est clairement faible, dites-le clairement mais constructivement
   - Évitez le biais de confirmation : challengez les hypothèses, ne les validez pas

**Format de réponse :**
- Utilisez Markdown avec titres, sous-titres et listes
- Structurez clairement : Analyse → Recommandation → Critique des autres idées
- Soyez concis mais complet : évitez les longueurs inutiles mais couvrez tous les points importants

Fournissez votre analyse de priorisation.\`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    return response.text?.trim() || "Aucune réponse générée";
  } catch (error) {
    console.error('Erreur lors de la priorisation des idées:', error);
    throw error;
  }
}
