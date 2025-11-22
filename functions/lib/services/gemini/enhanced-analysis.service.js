"use strict";
/**
 * Service d'analyse enrichie avec recherche web, SWOT et Go/No-Go
 * Sprint 1: Recherche Web + SWOT + Go/No-Go
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeBrainDumpEnhanced = analyzeBrainDumpEnhanced;
const gemini_service_js_1 = require("./gemini.service.js");
const serper_service_js_1 = require("../serper.service.js");
const genai_1 = require("@google/genai");
// Import des fonctions utilitaires depuis gemini.service
// On doit les importer depuis le fichier source
const gemini_service_js_2 = require("./gemini.service.js");
// Schéma SWOT
const swotSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        strengths: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    description: { type: genai_1.Type.STRING },
                    impact: { type: genai_1.Type.STRING, enum: ['high', 'medium', 'low'] },
                    evidence: { type: genai_1.Type.STRING, optional: true },
                },
                required: ['description', 'impact'],
            },
        },
        weaknesses: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    description: { type: genai_1.Type.STRING },
                    severity: { type: genai_1.Type.STRING, enum: ['high', 'medium', 'low'] },
                    mitigation: { type: genai_1.Type.STRING, optional: true },
                },
                required: ['description', 'severity'],
            },
        },
        opportunities: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    description: { type: genai_1.Type.STRING },
                    potential: { type: genai_1.Type.STRING, enum: ['high', 'medium', 'low'] },
                    timeframe: { type: genai_1.Type.STRING, optional: true },
                },
                required: ['description', 'potential'],
            },
        },
        threats: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    description: { type: genai_1.Type.STRING },
                    likelihood: { type: genai_1.Type.STRING, enum: ['high', 'medium', 'low'] },
                    impact: { type: genai_1.Type.STRING, enum: ['high', 'medium', 'low'] },
                    mitigation: { type: genai_1.Type.STRING, optional: true },
                },
                required: ['description', 'likelihood', 'impact'],
            },
        },
        strategicImplications: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
        },
    },
    required: ['strengths', 'weaknesses', 'opportunities', 'threats', 'strategicImplications'],
};
// Schéma analyse concurrentielle
const competitiveAnalysisSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        directCompetitors: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    name: { type: genai_1.Type.STRING },
                    url: { type: genai_1.Type.STRING, optional: true },
                    type: { type: genai_1.Type.STRING, enum: ['direct', 'indirect'] },
                    description: { type: genai_1.Type.STRING, optional: true },
                    strengths: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, optional: true },
                    weaknesses: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, optional: true },
                },
                required: ['name', 'type'],
            },
        },
        indirectCompetitors: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    name: { type: genai_1.Type.STRING },
                    url: { type: genai_1.Type.STRING, optional: true },
                    type: { type: genai_1.Type.STRING, enum: ['direct', 'indirect'] },
                    description: { type: genai_1.Type.STRING, optional: true },
                },
                required: ['name', 'type'],
            },
        },
        competitiveAdvantages: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
        },
        competitiveGaps: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
        },
        marketPosition: {
            type: genai_1.Type.STRING,
            enum: ['leader', 'challenger', 'follower', 'niche'],
        },
    },
    required: ['directCompetitors', 'indirectCompetitors', 'competitiveAdvantages', 'competitiveGaps', 'marketPosition'],
};
// Schéma Go/No-Go
const goNoGoSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        decision: {
            type: genai_1.Type.STRING,
            enum: ['go', 'no-go', 'pivot', 'wait'],
        },
        confidence: {
            type: Number,
            description: 'Niveau de confiance 0-100',
        },
        rationale: {
            type: genai_1.Type.STRING,
            description: 'Explication détaillée de la décision',
        },
        keyFactors: {
            type: genai_1.Type.OBJECT,
            properties: {
                positive: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                negative: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
            },
            required: ['positive', 'negative'],
        },
        conditions: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
        },
    },
    required: ['decision', 'confidence', 'rationale', 'keyFactors', 'conditions'],
};
/**
 * Analyse enrichie avec recherche web, SWOT et Go/No-Go
 */
async function analyzeBrainDumpEnhanced(brainDump, ideaTitle) {
    // 1. Analyse classique
    const analysis = await (0, gemini_service_js_1.analyzeBrainDump)(brainDump);
    // 2. Recherche web (si Serper configuré)
    const webResearch = await (0, serper_service_js_1.researchIdea)(ideaTitle || analysis.summary.slice(0, 50), analysis.summary);
    // 3. Générer SWOT avec contexte recherche web
    const swotPrompt = `Analysez cette idée d'entreprise et effectuez une analyse SWOT complète (Strengths, Weaknesses, Opportunities, Threats).

**Contexte de l'idée :**
${(0, gemini_service_js_2.escapePromptInput)(brainDump)}

**Résumé de l'analyse :**
${(0, gemini_service_js_2.escapePromptInput)(analysis.summary)}

**Risques identifiés :**
${analysis.potentialRisks.map(r => `- ${(0, gemini_service_js_2.escapePromptInput)(r)}`).join('\n')}

**Résultats recherche web :**
${webResearch.competitors.length > 0
        ? `Concurrents trouvés : ${webResearch.competitors.slice(0, 5).map(c => c.name).join(', ')}`
        : 'Aucun concurrent identifié via recherche web'}
${webResearch.marketTrends.length > 0
        ? `\nTendances marché : ${webResearch.marketTrends.map(t => t.trend).join(', ')}`
        : ''}

**Instructions :**
- Identifiez 3-5 forces (points forts de l'idée)
- Identifiez 3-5 faiblesses (points faibles à améliorer)
- Identifiez 3-5 opportunités (tendances, besoins non comblés)
- Identifiez 3-5 menaces (concurrence, risques marché)
- Ajoutez 2-4 implications stratégiques basées sur l'analyse SWOT

Soyez objectif et critique. Ne surévaluez pas les forces et ne sous-estimez pas les menaces.`;
    const swotAnalysis = await (0, gemini_service_js_2.generateContentWithSchema)({
        prompt: swotPrompt,
        schema: swotSchema,
    });
    // 4. Analyse concurrentielle
    const competitivePrompt = `Analysez la position concurrentielle de cette idée d'entreprise.

**Idée :**
${(0, gemini_service_js_2.escapePromptInput)(ideaTitle || analysis.summary.slice(0, 50))}
${(0, gemini_service_js_2.escapePromptInput)(analysis.summary)}

**Concurrents identifiés :**
${webResearch.competitors.map((c, i) => `${i + 1}. ${c.name}${c.description ? ` - ${c.description}` : ''}${c.url ? ` (${c.url})` : ''}`).join('\n') || 'Aucun concurrent direct identifié'}

**Instructions :**
- Classez les concurrents en directs (même marché/produit) et indirects (solutions alternatives)
- Identifiez 3-5 avantages concurrentiels possibles
- Identifiez 3-5 failles concurrentielles (où se positionner)
- Évaluez la position marché : leader, challenger, follower, ou niche

Soyez réaliste. Si le marché est saturé, indiquez "follower" ou "niche". Si c'est un nouveau marché, considérez "challenger" ou "leader".`;
    const competitiveAnalysis = await (0, gemini_service_js_2.generateContentWithSchema)({
        prompt: competitivePrompt,
        schema: competitiveAnalysisSchema,
    });
    // 5. Recommandation Go/No-Go
    const goNoGoPrompt = `En tant qu'investisseur VC expérimenté, recommandez si cette idée mérite d'être poursuivie (Go), abandonnée (No-Go), pivotée (Pivot), ou mise en attente (Wait).

**Idée :**
${(0, gemini_service_js_2.escapePromptInput)(ideaTitle || analysis.summary.slice(0, 50))}
${(0, gemini_service_js_2.escapePromptInput)(analysis.summary)}

**Analyse SWOT :**
Forces : ${swotAnalysis.strengths.map((s) => s.description).join('; ')}
Faiblesses : ${swotAnalysis.weaknesses.map((w) => w.description).join('; ')}
Opportunités : ${swotAnalysis.opportunities.map((o) => o.description).join('; ')}
Menaces : ${swotAnalysis.threats.map((t) => t.description).join('; ')}

**Position concurrentielle :**
${competitiveAnalysis.marketPosition}
Avantages : ${competitiveAnalysis.competitiveAdvantages.join('; ')}
Failles : ${competitiveAnalysis.competitiveGaps.join('; ')}

**Risques identifiés :**
${analysis.potentialRisks.join('; ')}

**Instructions :**
- Decision : "go" si idée solide et exécutable, "no-go" si fondamentalement faible, "pivot" si besoin changement direction, "wait" si marché pas prêt
- Confidence : 0-100, basé sur données disponibles et clarté du modèle
- Rationale : Explication détaillée justifiant la décision
- KeyFactors : 3-5 facteurs positifs et 3-5 facteurs négatifs clés
- Conditions : 2-4 conditions à remplir si décision est "wait" ou "pivot"

Soyez direct et honnête. Un "no-go" peut être plus utile qu'un "go" basé sur de mauvaises raisons.`;
    const goNoGo = await (0, gemini_service_js_2.generateContentWithSchema)({
        prompt: goNoGoPrompt,
        schema: goNoGoSchema,
    });
    return {
        analysis,
        swotAnalysis,
        webResearch,
        competitiveAnalysis,
        goNoGo,
    };
}
//# sourceMappingURL=enhanced-analysis.service.js.map