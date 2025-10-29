import { GoogleGenAI, Type } from "@google/genai";
import { Idea, IdeaAnalysis, IdeaEvaluation } from "../types";

// Initialize the Google Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Un résumé concis de l'idée principale, synthétisé à partir du brain dump. Doit faire 1-3 phrases.",
        },
        clarifyingQuestions: {
            type: Type.ARRAY,
            description: "Une liste de 3-5 questions critiques pour aider l'utilisateur à affiner son idée et considérer des aspects importants qu'il pourrait avoir manqués.",
            items: { type: Type.STRING }
        },
        potentialRisks: {
            type: Type.ARRAY,
            description: "Une liste de 3-5 risques ou défis potentiels associés à l'idée (marché, technique, exécution, etc.).",
            items: { type: Type.STRING }
        },
    },
    required: ["summary", "clarifyingQuestions", "potentialRisks"],
};

export async function analyzeBrainDump(brainDump: string): Promise<IdeaAnalysis> {
    const prompt = `Analysez le brain dump d'idée d'entreprise suivant. Extrayez le concept principal, identifiez les domaines clés qui nécessitent plus de réflexion, et listez les risques potentiels. L'utilisateur est aux tout premiers stades de l'idéation. Votre objectif est de fournir un retour structuré pour l'aider à clarifier sa pensée.

Brain Dump :
---
${brainDump}
---

Fournissez votre analyse au format JSON spécifié. Le résumé doit être concis. Les questions de clarification doivent inciter l'utilisateur à réfléchir plus profondément à son public cible, sa proposition de valeur et son exécution. Les risques potentiels doivent être réalistes et actionables.`;

    // Generate content using the Gemini API with a specific JSON schema
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed as IdeaAnalysis;
    } catch (e) {
        console.error("Failed to parse analysis JSON:", jsonText);
        throw new Error("The model returned an invalid analysis format.");
    }
}


const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        problemUrgency: {
            type: Type.NUMBER,
            description: "Score (1-10) pour l'urgence et la douleur du problème pour le public cible. 1 n'est pas un problème, 10 est un problème critique.",
        },
        targetMarketSize: {
            type: Type.NUMBER,
            description: "Score (1-10) pour la taille et l'accessibilité du marché cible. 1 est une niche minuscule et difficile à atteindre, 10 est un marché massif, en croissance et accessible.",
        },
        competitiveAdvantage: {
            type: Type.NUMBER,
            description: "Score (1-10) pour le potentiel de l'idée à avoir un avantage concurrentiel unique et défendable (ex: technologie unique, effets de réseau, marque). 1 est une commodité, 10 est un fossé définitif de catégorie.",
        },
        personalAlignment: {
            type: Type.NUMBER,
            description: "Score (1-10) pour la façon dont l'idée s'aligne avec les compétences, passions et ressources du fondateur. 1 est un décalage complet, 10 est un ajustement parfait.",
        },
        technicalFeasibility: {
            type: Type.NUMBER,
            description: "Score (1-10) pour la difficulté technique de construire un MVP. 1 est extrêmement complexe (ex: nécessite une recherche IA approfondie), 10 est simple avec la technologie existante.",
        },
    },
    required: ["problemUrgency", "targetMarketSize", "competitiveAdvantage", "personalAlignment", "technicalFeasibility"],
};


export async function evaluateIdea(idea: Idea): Promise<IdeaEvaluation> {
    const prompt = `Évaluez l'idée d'entreprise suivante basée sur son analyse. Fournissez un score de 1 à 10 pour chacun des cinq critères. Soyez réaliste et critique dans votre évaluation.

Titre de l'idée : ${idea.title}

Résumé du Brain Dump :
${idea.analysis?.summary}

Questions de clarification (à considérer pendant l'évaluation) :
- ${idea.analysis?.clarifyingQuestions.join('\n- ')}

Risques potentiels (à considérer pendant l'évaluation) :
- ${idea.analysis?.potentialRisks.join('\n- ')}

---
Fournissez votre évaluation au format JSON spécifié. Les scores doivent être des entiers entre 1 et 10.`;

    // Generate content using the Gemini API with a specific JSON schema
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: evaluationSchema,
        },
    });
    
    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed as IdeaEvaluation;
    } catch (e) {
        console.error("Failed to parse evaluation JSON:", jsonText);
        throw new Error("The model returned an invalid evaluation format.");
    }
}

const roadmapSchema = {
    type: Type.OBJECT,
    properties: {
        roadmapSteps: {
            type: Type.ARRAY,
            description: "Une liste de 5-7 étapes de haut niveau et actionables pour valider l'idée et construire un MVP. Commencez par les étapes de validation avant de passer à la construction.",
            items: { type: Type.STRING }
        },
    },
    required: ["roadmapSteps"],
};

export async function generateRoadmap(idea: Idea): Promise<string[]> {
    const prompt = `Basé sur l'idée d'entreprise évaluée suivante, générez une feuille de route de haut niveau et actionnable avec 5-7 étapes. La feuille de route doit se concentrer sur la validation de l'idée d'abord, puis se diriger vers la construction d'un Produit Minimum Viable (MVP).

Titre de l'idée : ${idea.title}

Résumé : ${idea.analysis?.summary}

Scores d'évaluation :
- Opportunité : ${idea.opportunityScore?.toFixed(1)}/10
- Faisabilité : ${idea.feasibilityScore?.toFixed(1)}/10

---
Générez une liste d'étapes de feuille de route au format JSON spécifié. Chaque étape doit être un élément d'action clair et concis.`;

    // Generate content using the Gemini API with a specific JSON schema
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: roadmapSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed.roadmapSteps as string[];
    } catch (e) {
        console.error("Failed to parse roadmap JSON:", jsonText);
        throw new Error("The model returned an invalid roadmap format.");
    }
}


export async function prioritizeIdeas(ideas: Idea[]): Promise<string> {
    const ideaSummaries = ideas.map(idea => `
---
### ${idea.title}
- **Concept :** ${idea.analysis?.summary}
- **Score d'Opportunité :** ${idea.opportunityScore?.toFixed(1)}/10 (Urgence: ${idea.evaluation?.problemUrgency}, Taille du marché: ${idea.evaluation?.targetMarketSize}, Avantage: ${idea.evaluation?.competitiveAdvantage})
- **Score de Faisabilité :** ${idea.feasibilityScore?.toFixed(1)}/10 (Alignement: ${idea.evaluation?.personalAlignment}, Technique: ${idea.evaluation?.technicalFeasibility})
---
`).join('\n');

    const prompt = `Vous êtes un conseiller en startup. Basé sur la liste suivante d'idées d'entreprise évaluées, fournissez une analyse de priorisation.

${ideaSummaries}

Votre analyse doit :
1.  Fournir une recommandation claire sur quelle idée poursuivre en premier.
2.  Justifier votre recommandation basée sur les scores fournis et une vue holistique de l'opportunité vs la faisabilité.
3.  Commenter brièvement les autres idées et pourquoi elles sont de priorité plus faible.
4.  Structurer votre réponse au format Markdown. Utilisez des titres et des puces pour la clarté.`;

    // Generate content using the Gemini API
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}
