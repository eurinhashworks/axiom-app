import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
// Types inline pour éviter les problèmes d'import
interface IdeaAnalysis {
  summary: string;
  clarifyingQuestions: string[];
  potentialRisks: string[];
  problemUrgency: number;
  targetAudience: number;
  competitionLevel: number;
}

interface IdeaEvaluation {
  problemUrgency: number;
  targetMarketSize: number;
  competitiveAdvantage: number;
  personalAlignment: number;
  technicalFeasibility: number;
  technicalComplexity: number;
  timeToMarket: number;
  resourceRequirements: number;
  marketTiming: number;
  revenuePotential: number;
  costEfficiency: number;
  scalability: number;
  riskLevel: number;
  innovationLevel: number;
}

interface RoadmapStep {
  text: string;
  completed: boolean;
}

interface Idea {
  id: string;
  title: string;
  status: 'DRAFT' | 'ANALYZING' | 'ANALYZED' | 'EVALUATED' | 'ROADMAP_GENERATED';
  brainDump: string;
  createdAt: number;
  analysis?: IdeaAnalysis;
  evaluation?: IdeaEvaluation;
  roadmapSteps?: RoadmapStep[];
  opportunityScore?: number;
  feasibilityScore?: number;
  isPublic?: boolean;
  authorId?: string;
  authorName?: string;
  authorPhotoURL?: string;
  marketSize: number;
  problemUrgency: number;
  targetAudience: number;
}

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// Configuration Firebase (utiliser les variables d'environnement)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Erreur: Variables d\'environnement Firebase manquantes');
  console.error('Assurez-vous que votre fichier .env contient toutes les variables VITE_FIREBASE_*');
  process.exit(1);
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Noms d'auteurs fictifs pour rendre la plateforme plus réaliste
const AUTHORS = [
  { name: 'Alexandre Dubois', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexandre' },
  { name: 'Sophie Martin', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie' },
  { name: 'Thomas Bernard', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thomas' },
  { name: 'Marie Leclerc', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie' },
  { name: 'Lucas Moreau', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas' },
  { name: 'Emma Durand', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma' },
  { name: 'Pierre Rousseau', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre' },
  { name: 'Julie Petit', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julie' },
  { name: 'Marc Girard', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marc' },
  { name: 'Camille Blanc', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=camille' }
];

// Fonction pour parser le fichier markdown et extraire les idées
function parseIdeasFromMarkdown(content: string): Array<{ title: string; category: string; description: string }> {
  const ideas: Array<{ title: string; category: string; description: string }> = [];
  const lines = content.split('\n');
  
  let currentCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter les catégories (## **I. CLOUD** ou ## **I. CLOUD COMPUTING**)
    if (line.startsWith('##') && line.includes('**')) {
      // Extraire le nom de la catégorie entre **
      const match = line.match(/\*\*([^*]+)\*\*/);
      if (match) {
        currentCategory = match[1].trim();
      }
    } else if (line.startsWith('##') && !line.includes('**')) {
      // Catégorie simple sans formatage
      currentCategory = line.replace('##', '').trim();
    }
    
    // Détecter les idées (format: "1. **Nom** – Description" ou "1. **Nom** – Description.")
    const ideaMatch = line.match(/^\d+\.\s+\*\*([^*]+)\*\*\s*[–-]\s*(.+)$/);
    if (ideaMatch) {
      ideas.push({
        title: ideaMatch[1].trim(),
        category: currentCategory || 'Non catégorisé',
        description: ideaMatch[2].trim().replace(/\.$/, '') // Retirer le point final si présent
      });
    }
  }
  
  return ideas;
}

// Fonction pour générer un brain dump réaliste à partir d'une idée
function generateBrainDump(title: string, description: string, category: string): string {
  return `${description}

Cette idée s'inscrit dans la catégorie ${category} et vise à répondre à un besoin réel du marché. 

Contexte et opportunité :
- Le marché actuel présente des lacunes dans ce domaine
- Les solutions existantes sont souvent coûteuses ou peu adaptées
- Il existe une demande croissante pour des outils modernes et accessibles

Vision :
- Créer une solution qui soit à la fois innovante et accessible
- Construire un produit qui apporte une réelle valeur ajoutée
- Développer une communauté autour de cette idée

Prochaines étapes envisagées :
- Validation du concept auprès de la cible
- Développement d'un MVP fonctionnel
- Tests utilisateurs et itérations
- Lancement et croissance

${title} représente une opportunité intéressante pour transformer cette vision en réalité.`;
}

// Fonction pour générer une analyse IA réaliste
function generateAnalysis(title: string, description: string, category: string): IdeaAnalysis {
  const summaries = [
    `Une solution innovante dans le domaine ${category} qui répond à un besoin croissant du marché.`,
    `Concept prometteur qui combine technologie moderne et utilité pratique dans ${category}.`,
    `Idée stratégique qui pourrait transformer l'approche actuelle de ${category}.`,
    `Solution potentiellement disruptive dans le secteur ${category} avec un fort potentiel.`
  ];
  
  const clarifyingQuestions = [
    `Quel est le profil exact de la cible principale pour ${title} ?`,
    `Quels sont les principaux concurrents directs et indirects ?`,
    `Quel modèle économique serait le plus adapté pour cette solution ?`,
    `Quelles sont les fonctionnalités essentielles pour un MVP ?`,
    `Comment mesurer le succès et la valeur apportée aux utilisateurs ?`
  ];
  
  const potentialRisks = [
    `Complexité technique potentielle dans le développement initial`,
    `Concurrence du marché pouvant être importante`,
    `Besoin de validation utilisateur avant d'investir pleinement`,
    `Ressources nécessaires pour le développement et la maintenance`,
    `Défis de distribution et d'acquisition d'utilisateurs`
  ];
  
  return {
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    clarifyingQuestions: clarifyingQuestions,
    potentialRisks: potentialRisks,
    problemUrgency: Math.floor(Math.random() * 3) + 6, // 6-8
    targetAudience: Math.floor(Math.random() * 3) + 6, // 6-8
    competitionLevel: Math.floor(Math.random() * 3) + 5 // 5-7
  };
}

// Fonction pour générer une évaluation réaliste
function generateEvaluation(title: string, category: string): IdeaEvaluation {
  const baseScore = 6 + Math.random() * 2; // 6-8
  
  return {
    problemUrgency: Math.floor(baseScore + Math.random() * 2),
    targetMarketSize: Math.floor(baseScore + Math.random() * 2),
    competitiveAdvantage: Math.floor(baseScore + Math.random() * 2),
    personalAlignment: Math.floor(5 + Math.random() * 3),
    technicalFeasibility: Math.floor(6 + Math.random() * 2),
    technicalComplexity: Math.floor(5 + Math.random() * 3),
    timeToMarket: Math.floor(4 + Math.random() * 4),
    resourceRequirements: Math.floor(5 + Math.random() * 3),
    marketTiming: Math.floor(6 + Math.random() * 2),
    revenuePotential: Math.floor(6 + Math.random() * 2),
    costEfficiency: Math.floor(6 + Math.random() * 2),
    scalability: Math.floor(7 + Math.random() * 2),
    riskLevel: Math.floor(4 + Math.random() * 3),
    innovationLevel: Math.floor(7 + Math.random() * 2)
  };
}

// Fonction pour générer une roadmap
function generateRoadmap(title: string): RoadmapStep[] {
  const steps = [
    'Validation du concept et recherche utilisateur',
    'Développement du prototype et tests initiaux',
    'Création du MVP avec fonctionnalités essentielles',
    'Tests bêta avec un groupe restreint d\'utilisateurs',
    'Itérations basées sur les retours utilisateurs',
    'Lancement public et stratégie de croissance',
    'Amélioration continue et ajout de nouvelles fonctionnalités'
  ];
  
  return steps.slice(0, 5 + Math.floor(Math.random() * 3)).map((text, index) => ({
    text,
    completed: index < 2 // Les 2 premières étapes sont complétées
  }));
}

// Fonction pour calculer les scores
function calculateScores(evaluation: IdeaEvaluation): { opportunity: number; feasibility: number } {
  const opportunity = (
    evaluation.problemUrgency * 0.3 +
    evaluation.targetMarketSize * 0.3 +
    evaluation.competitiveAdvantage * 0.2 +
    evaluation.marketTiming * 0.2
  ) / 10;
  
  const feasibility = (
    evaluation.technicalFeasibility * 0.25 +
    evaluation.personalAlignment * 0.2 +
    evaluation.resourceRequirements * 0.2 +
    evaluation.costEfficiency * 0.15 +
    evaluation.scalability * 0.2
  ) / 10;
  
  return {
    opportunity: Math.round(opportunity * 10) / 10,
    feasibility: Math.round(feasibility * 10) / 10
  };
}

// Fonction principale pour injecter les idées
async function injectIdeas() {
  try {
    console.log('📖 Lecture du fichier markdown...');
    const filePath = join(__dirname, '..', 'docs', '200_idee.md');
    const content = readFileSync(filePath, 'utf-8');
    
    console.log('🔍 Parsing des idées...');
    const rawIdeas = parseIdeasFromMarkdown(content);
    
    console.log(`✅ ${rawIdeas.length} idées trouvées`);
    
    const ideasCollection = collection(db, 'ideas');
    let successCount = 0;
    let errorCount = 0;
    
    // Générer des dates de création variées (derniers 6 mois)
    const now = Date.now();
    const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < rawIdeas.length; i++) {
      const rawIdea = rawIdeas[i];
      const author = AUTHORS[i % AUTHORS.length];
      
      // Générer les données
      const brainDump = generateBrainDump(rawIdea.title, rawIdea.description, rawIdea.category);
      const analysis = generateAnalysis(rawIdea.title, rawIdea.description, rawIdea.category);
      const evaluation = generateEvaluation(rawIdea.title, rawIdea.category);
      const roadmapSteps = generateRoadmap(rawIdea.title);
      const scores = calculateScores(evaluation);
      
      // Générer une date de création aléatoire
      const createdAt = Math.floor(sixMonthsAgo + Math.random() * (now - sixMonthsAgo));
      
      const idea: Idea = {
        id: `public-idea-${i + 1}`,
        title: rawIdea.title,
        status: 'ROADMAP_GENERATED',
        brainDump,
        createdAt,
        analysis,
        evaluation,
        roadmapSteps,
        opportunityScore: scores.opportunity,
        feasibilityScore: scores.feasibility,
        isPublic: true,
        authorId: `author-${i % AUTHORS.length}`,
        authorName: author.name,
        authorPhotoURL: author.photo,
        marketSize: evaluation.targetMarketSize * 10,
        problemUrgency: evaluation.problemUrgency,
        targetAudience: evaluation.targetMarketSize
      };
      
      try {
        const ideaRef = doc(ideasCollection, idea.id);
        await setDoc(ideaRef, {
          ...idea,
          userId: idea.authorId, // Pour la compatibilité avec les requêtes
          createdAt: Timestamp.fromMillis(idea.createdAt),
          updatedAt: Timestamp.now()
        }, { merge: true }); // Utiliser merge pour éviter les erreurs
        
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`📝 ${i + 1}/${rawIdeas.length} idées injectées...`);
        }
      } catch (error: any) {
        console.error(`❌ Erreur pour l'idée "${rawIdea.title}":`, error?.message || error);
        errorCount++;
        // Continuer même en cas d'erreur
      }
      
      // Pause pour éviter de surcharger Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✅ Injection terminée !');
    console.log(`✅ ${successCount} idées injectées avec succès`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'injection:', error);
    process.exit(1);
  }
}

// Exécuter le script
injectIdeas().then(() => {
  console.log('\n🎉 Script terminé avec succès !');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

