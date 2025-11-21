/**
 * Service d'analyse enrichie avec recherche web, SWOT et Go/No-Go
 * Sprint 1: Recherche Web + SWOT + Go/No-Go
 */

import { analyzeBrainDump } from './gemini.service.js';
import { researchIdea } from '../serper.service.js';
import { Type } from '@google/genai';
import {
  SWOTAnalysis,
  CompetitiveAnalysis,
  GoNoGoRecommendation,
  WebResearchResults,
  IdeaAnalysis,
} from '../../types/shared.js';

// Import des fonctions utilitaires depuis gemini.service
// On doit les importer depuis le fichier source
import {
  generateContentWithSchema,
  retryWithBackoff,
  escapePromptInput,
} from './gemini.service.js';

// Schéma SWOT
const swotSchema = {
  type: Type.OBJECT,
  properties: {
    strengths: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          evidence: { type: Type.STRING, optional: true },
        },
        required: ['description', 'impact'],
      },
    },
    weaknesses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          mitigation: { type: Type.STRING, optional: true },
        },
        required: ['description', 'severity'],
      },
    },
    opportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          potential: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          timeframe: { type: Type.STRING, optional: true },
        },
        required: ['description', 'potential'],
      },
    },
    threats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          likelihood: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          mitigation: { type: Type.STRING, optional: true },
        },
        required: ['description', 'likelihood', 'impact'],
      },
    },
    strategicImplications: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['strengths', 'weaknesses', 'opportunities', 'threats', 'strategicImplications'],
};

// Schéma analyse concurrentielle
const competitiveAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    directCompetitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          url: { type: Type.STRING, optional: true },
          type: { type: Type.STRING, enum: ['direct', 'indirect'] },
          description: { type: Type.STRING, optional: true },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, optional: true },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, optional: true },
        },
        required: ['name', 'type'],
      },
    },
    indirectCompetitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          url: { type: Type.STRING, optional: true },
          type: { type: Type.STRING, enum: ['direct', 'indirect'] },
          description: { type: Type.STRING, optional: true },
        },
        required: ['name', 'type'],
      },
    },
    competitiveAdvantages: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    competitiveGaps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    marketPosition: {
      type: Type.STRING,
      enum: ['leader', 'challenger', 'follower', 'niche'],
    },
  },
  required: ['directCompetitors', 'indirectCompetitors', 'competitiveAdvantages', 'competitiveGaps', 'marketPosition'],
};

// Schéma Go/No-Go
const goNoGoSchema = {
  type: Type.OBJECT,
  properties: {
    decision: {
      type: Type.STRING,
      enum: ['go', 'no-go', 'pivot', 'wait'],
    },
    confidence: {
      type: Number,
      description: 'Niveau de confiance 0-100',
    },
    rationale: {
      type: Type.STRING,
      description: 'Explication détaillée de la décision',
    },
    keyFactors: {
      type: Type.OBJECT,
      properties: {
        positive: { type: Type.ARRAY, items: { type: Type.STRING } },
        negative: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['positive', 'negative'],
    },
    conditions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['decision', 'confidence', 'rationale', 'keyFactors', 'conditions'],
};

/**
 * Analyse enrichie avec recherche web, SWOT et Go/No-Go
 */
export async function analyzeBrainDumpEnhanced(
  brainDump: string,
  ideaTitle?: string
): Promise<{
  analysis: IdeaAnalysis;
  swotAnalysis: SWOTAnalysis;
  webResearch: WebResearchResults;
  competitiveAnalysis: CompetitiveAnalysis;
  goNoGo: GoNoGoRecommendation;
}> {
  // 1. Analyse classique
  const analysis = await analyzeBrainDump(brainDump);

  // 2. Recherche web (si Serper configuré)
  const webResearch = await researchIdea(ideaTitle || analysis.summary.slice(0, 50), analysis.summary);

  // 3. Générer SWOT avec contexte recherche web
  const swotPrompt = `Analysez cette idée d'entreprise et effectuez une analyse SWOT complète (Strengths, Weaknesses, Opportunities, Threats).

**Contexte de l'idée :**
${escapePromptInput(brainDump)}

**Résumé de l'analyse :**
${escapePromptInput(analysis.summary)}

**Risques identifiés :**
${analysis.potentialRisks.map(r => \`- \${escapePromptInput(r)}\`).join('\n')}

**Résultats recherche web :**
\${webResearch.competitors.length > 0
  ? \`Concurrents trouvés : \${webResearch.competitors.slice(0, 5).map(c => c.name).join(', ')}\`
  : 'Aucun concurrent identifié via recherche web'}
\${webResearch.marketTrends.length > 0
  ? \`\\nTendances marché : \${webResearch.marketTrends.map(t => t.trend).join(', ')}\`
  : ''}

**Instructions :**
- Identifiez 3-5 forces (points forts de l'idée)
- Identifiez 3-5 faiblesses (points faibles à améliorer)
- Identifiez 3-5 opportunités (tendances, besoins non comblés)
- Identifiez 3-5 menaces (concurrence, risques marché)
- Ajoutez 2-4 implications stratégiques basées sur l'analyse SWOT

Soyez objectif et critique. Ne surévaluez pas les forces et ne sous-estimez pas les menaces.`;

  const swotAnalysis = await retryWithBackoff(async () => {
    return await generateContentWithSchema<SWOTAnalysis>({
      prompt: swotPrompt,
      schema: swotSchema,
      functionName: 'generateSWOT',
    });
  });

  // 4. Analyse concurrentielle
  const competitivePrompt = `Analysez la position concurrentielle de cette idée d'entreprise.

**Idée :**
\${escapePromptInput(ideaTitle || analysis.summary.slice(0, 50))}
\${escapePromptInput(analysis.summary)}

**Concurrents identifiés :**
\${webResearch.competitors.map((c, i) => \`\${i + 1}. \${c.name}\${c.description ? \` - \${c.description}\` : ''}\${c.url ? \` (\${c.url})\` : ''}\`).join('\n') || 'Aucun concurrent direct identifié'}

**Instructions :**
- Classez les concurrents en directs (même marché/produit) et indirects (solutions alternatives)
- Identifiez 3-5 avantages concurrentiels possibles
- Identifiez 3-5 failles concurrentielles (où se positionner)
- Évaluez la position marché : leader, challenger, follower, ou niche

Soyez réaliste. Si le marché est saturé, indiquez "follower" ou "niche". Si c'est un nouveau marché, considérez "challenger" ou "leader".`;

  const competitiveAnalysis = await retryWithBackoff(async () => {
    return await generateContentWithSchema<CompetitiveAnalysis>({
      prompt: competitivePrompt,
      schema: competitiveAnalysisSchema,
      functionName: 'generateCompetitiveAnalysis',
    });
  });

  // 5. Recommandation Go/No-Go
  const goNoGoPrompt = `En tant qu'investisseur VC expérimenté, recommandez si cette idée mérite d'être poursuivie (Go), abandonnée (No-Go), pivotée (Pivot), ou mise en attente (Wait).

**Idée :**
\${escapePromptInput(ideaTitle || analysis.summary.slice(0, 50))}
\${escapePromptInput(analysis.summary)}

**Analyse SWOT :**
Forces : \${swotAnalysis.strengths.map(s => s.description).join('; ')}
Faiblesses : \${swotAnalysis.weaknesses.map(w => w.description).join('; ')}
Opportunités : \${swotAnalysis.opportunities.map(o => o.description).join('; ')}
Menaces : \${swotAnalysis.threats.map(t => t.description).join('; ')}

**Position concurrentielle :**
\${competitiveAnalysis.marketPosition}
Avantages : \${competitiveAnalysis.competitiveAdvantages.join('; ')}
Failles : \${competitiveAnalysis.competitiveGaps.join('; ')}

**Risques identifiés :**
\${analysis.potentialRisks.join('; ')}

**Instructions :**
- Decision : "go" si idée solide et exécutable, "no-go" si fondamentalement faible, "pivot" si besoin changement direction, "wait" si marché pas prêt
- Confidence : 0-100, basé sur données disponibles et clarté du modèle
- Rationale : Explication détaillée justifiant la décision
- KeyFactors : 3-5 facteurs positifs et 3-5 facteurs négatifs clés
- Conditions : 2-4 conditions à remplir si décision est "wait" ou "pivot"

Soyez direct et honnête. Un "no-go" peut être plus utile qu'un "go" basé sur de mauvaises raisons.`;

  const goNoGo = await retryWithBackoff(async () => {
    return await generateContentWithSchema<GoNoGoRecommendation>({
      prompt: goNoGoPrompt,
      schema: goNoGoSchema,
      functionName: 'generateGoNoGo',
    });
  });

  return {
    analysis,
    swotAnalysis,
    webResearch,
    competitiveAnalysis,
    goNoGo,
  };
}
