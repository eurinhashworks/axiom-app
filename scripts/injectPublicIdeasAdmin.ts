import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// Types inline
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
  createdAt: admin.firestore.Timestamp;
  analysis?: IdeaAnalysis;
  evaluation?: IdeaEvaluation;
  roadmapSteps?: RoadmapStep[];
  opportunityScore?: number;
  feasibilityScore?: number;
  isPublic?: boolean;
  authorId?: string;
  authorName?: string;
  authorPhotoURL?: string;
  userId: string;
  marketSize: number;
  problemUrgency: number;
  targetAudience: number;
  updatedAt: admin.firestore.Timestamp;
}

// Initialiser Firebase Admin SDK
// Option 1: Utiliser une clé de service (recommandé pour production)
// Option 2: Utiliser l'authentification par défaut (nécessite GOOGLE_APPLICATION_CREDENTIALS)
// Option 3: Utiliser uniquement le projectId (fonctionne avec l'émulateur ou si les règles sont assouplies)

let adminApp: admin.app.App;

try {
  // Essayer d'abord avec une clé de service dans les variables d'environnement
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log('✅ Firebase Admin initialisé avec clé de service');
  } 
  // Sinon, essayer de charger le fichier directement depuis la racine du projet
  else {
    const serviceAccountPath = join(__dirname, '..', 'firebase-service-account.json');
    if (existsSync(serviceAccountPath)) {
      const serviceAccountContent = readFileSync(serviceAccountPath, 'utf-8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
      });
      console.log('✅ Firebase Admin initialisé avec fichier firebase-service-account.json');
    }
    // Sinon, utiliser l'authentification par défaut (nécessite GOOGLE_APPLICATION_CREDENTIALS)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      adminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('✅ Firebase Admin initialisé avec authentification par défaut');
    }
    // Sinon, utiliser uniquement le projectId (nécessite de modifier temporairement les règles Firestore)
    else if (process.env.VITE_FIREBASE_PROJECT_ID) {
      adminApp = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      });
      console.log('⚠️  Firebase Admin initialisé avec projectId uniquement');
      console.log('⚠️  ATTENTION: Vous devrez peut-être modifier temporairement les règles Firestore');
    } else {
      throw new Error('Configuration Firebase Admin manquante');
    }
  }
} catch (error: any) {
  console.error('❌ Erreur d\'initialisation Firebase Admin:', error.message);
  console.error('\n💡 Options pour résoudre:');
  console.error('1. Téléchargez une clé de service depuis Firebase Console > Project Settings > Service Accounts');
  console.error('2. Ajoutez FIREBASE_SERVICE_ACCOUNT_KEY dans votre .env avec le JSON complet');
  console.error('3. Ou définissez GOOGLE_APPLICATION_CREDENTIALS avec le chemin vers le fichier JSON');
  console.error('4. Ou modifiez temporairement les règles Firestore pour permettre l\'écriture');
  process.exit(1);
}

const db = adminApp.firestore();

// Noms d'auteurs fictifs
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

// Fonction pour parser le fichier markdown
function parseIdeasFromMarkdown(content: string): Array<{ title: string; category: string; description: string }> {
  const ideas: Array<{ title: string; category: string; description: string }> = [];
  const lines = content.split('\n');
  
  let currentCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('##') && line.includes('**')) {
      const match = line.match(/\*\*([^*]+)\*\*/);
      if (match) {
        currentCategory = match[1].trim();
      }
    } else if (line.startsWith('##') && !line.includes('**')) {
      currentCategory = line.replace('##', '').trim();
    }
    
    const ideaMatch = line.match(/^\d+\.\s+\*\*([^*]+)\*\*\s*[–-]\s*(.+)$/);
    if (ideaMatch) {
      ideas.push({
        title: ideaMatch[1].trim(),
        category: currentCategory || 'Non catégorisé',
        description: ideaMatch[2].trim().replace(/\.$/, '')
      });
    }
  }
  
  return ideas;
}

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

function generateAnalysis(title: string, description: string, category: string): IdeaAnalysis {
  const summaries = [
    `Une solution innovante dans le domaine ${category} qui répond à un besoin croissant du marché.`,
    `Concept prometteur qui combine technologie moderne et utilité pratique dans ${category}.`,
    `Idée stratégique qui pourrait transformer l'approche actuelle de ${category}.`,
    `Solution potentiellement disruptive dans le secteur ${category} avec un fort potentiel.`
  ];
  
  return {
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    clarifyingQuestions: [
      `Quel est le profil exact de la cible principale pour ${title} ?`,
      `Quels sont les principaux concurrents directs et indirects ?`,
      `Quel modèle économique serait le plus adapté pour cette solution ?`,
      `Quelles sont les fonctionnalités essentielles pour un MVP ?`,
      `Comment mesurer le succès et la valeur apportée aux utilisateurs ?`
    ],
    potentialRisks: [
      `Complexité technique potentielle dans le développement initial`,
      `Concurrence du marché pouvant être importante`,
      `Besoin de validation utilisateur avant d'investir pleinement`,
      `Ressources nécessaires pour le développement et la maintenance`,
      `Défis de distribution et d'acquisition d'utilisateurs`
    ],
    problemUrgency: Math.floor(Math.random() * 3) + 6,
    targetAudience: Math.floor(Math.random() * 3) + 6,
    competitionLevel: Math.floor(Math.random() * 3) + 5
  };
}

function generateEvaluation(title: string, category: string): IdeaEvaluation {
  const baseScore = 6 + Math.random() * 2;
  
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
    completed: index < 2
  }));
}

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

async function injectIdeas() {
  try {
    console.log('📖 Lecture du fichier markdown...');
    const filePath = join(__dirname, '..', 'docs', '200_idee.md');
    const content = readFileSync(filePath, 'utf-8');
    
    console.log('🔍 Parsing des idées...');
    const rawIdeas = parseIdeasFromMarkdown(content);
    
    console.log(`✅ ${rawIdeas.length} idées trouvées`);
    
    let successCount = 0;
    let errorCount = 0;
    
    const now = Date.now();
    const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < rawIdeas.length; i++) {
      const rawIdea = rawIdeas[i];
      const author = AUTHORS[i % AUTHORS.length];
      
      const brainDump = generateBrainDump(rawIdea.title, rawIdea.description, rawIdea.category);
      const analysis = generateAnalysis(rawIdea.title, rawIdea.description, rawIdea.category);
      const evaluation = generateEvaluation(rawIdea.title, rawIdea.category);
      const roadmapSteps = generateRoadmap(rawIdea.title);
      const scores = calculateScores(evaluation);
      
      const createdAt = Math.floor(sixMonthsAgo + Math.random() * (now - sixMonthsAgo));
      
      const ideaData: Omit<Idea, 'id'> & { id?: string } = {
        id: `public-idea-${i + 1}`,
        title: rawIdea.title,
        status: 'ROADMAP_GENERATED',
        brainDump,
        createdAt: admin.firestore.Timestamp.fromMillis(createdAt),
        analysis,
        evaluation,
        roadmapSteps,
        opportunityScore: scores.opportunity,
        feasibilityScore: scores.feasibility,
        isPublic: true,
        authorId: `author-${i % AUTHORS.length}`,
        authorName: author.name,
        authorPhotoURL: author.photo,
        userId: `author-${i % AUTHORS.length}`,
        marketSize: evaluation.targetMarketSize * 10,
        problemUrgency: evaluation.problemUrgency,
        targetAudience: evaluation.targetMarketSize,
        updatedAt: admin.firestore.Timestamp.now()
      };
      
      try {
        const ideaRef = db.collection('ideas').doc(ideaData.id!);
        // Préparer les données pour Firestore (convertir les Timestamps)
        const firestoreData: any = {
          ...ideaData,
          // Les Timestamps sont déjà des admin.firestore.Timestamp, pas besoin de conversion
        };
        
        await ideaRef.set(firestoreData, { merge: true });
        
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`📝 ${i + 1}/${rawIdeas.length} idées injectées...`);
        }
      } catch (error: any) {
        // Ne pas logger toutes les erreurs individuellement si c'est le même problème
        if (error?.code === 5 || error?.message?.includes('NOT_FOUND')) {
          if (errorCount === 0) {
            console.error(`❌ Erreur NOT_FOUND - Vérifiez que Firestore est activé dans Firebase Console`);
            console.error(`   Erreur détaillée:`, error?.message || error);
          }
          errorCount++;
          // Continuer pour voir combien d'erreurs on a
        } else {
          console.error(`❌ Erreur pour l'idée "${rawIdea.title}":`, error?.code || error?.message || error);
          errorCount++;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
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

injectIdeas().then(() => {
  console.log('\n🎉 Script terminé avec succès !');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

