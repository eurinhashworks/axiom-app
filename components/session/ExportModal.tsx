import React, { useRef, useState } from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ExportModalProps {
    idea: Idea;
    onClose: () => void;
}

type ExportFormat = 'markdown' | 'json' | 'ai-studio-prompt' | 'lovable-prompt' | 'v0-prompt' | 'github-issues' | 'project-starter';

const ExportModal: React.FC<ExportModalProps> = ({ idea, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copier dans le Presse-papiers');
    const [exportFormat, setExportFormat] = useState<ExportFormat>('markdown');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const generateContent = (): string => {
        switch (exportFormat) {
            case 'json':
                return generateJSON();
            case 'ai-studio-prompt':
                return generateAIStudioPrompt();
            case 'lovable-prompt':
                return generateLovablePrompt();
            case 'v0-prompt':
                return generateV0Prompt();
            case 'github-issues':
                return generateGitHubIssues();
            case 'project-starter':
                return generateProjectStarter();
            default:
                return generateMarkdown();
        }
    };

    const generateMarkdown = (): string => {
        let markdown = `# ${idea.title}\n\n`;
        markdown += `**Statut:** ${idea.status}\n`;
        markdown += `**Score d'Opportunité:** ${idea.opportunityScore?.toFixed(1) || 'N/A'}/10\n`;
        markdown += `**Score de Faisabilité:** ${idea.feasibilityScore?.toFixed(1) || 'N/A'}/10\n\n`;

        if (idea.analysis) {
            markdown += `## Analyse\n\n`;
            markdown += `### Résumé\n${idea.analysis.summary}\n\n`;
            markdown += `### Questions de Clarification\n`;
            idea.analysis.clarifyingQuestions.forEach((q: any) => {
                const questionText = typeof q === 'string' ? q : q.question;
                markdown += `- ${questionText}\n`;
            });
            markdown += `\n`;
            markdown += `### Risques Potentiels\n`;
            idea.analysis.potentialRisks.forEach(r => markdown += `- ${r}\n`);
            markdown += `\n`;
        }

        if (idea.evaluation) {
            markdown += `## Évaluation Détaillée\n\n`;
            markdown += `- **Urgence du Problème:** ${idea.evaluation.problemUrgency}/10\n`;
            markdown += `- **Taille du Marché Cible:** ${idea.evaluation.targetMarketSize}/10\n`;
            markdown += `- **Avantage Concurrentiel:** ${idea.evaluation.competitiveAdvantage}/10\n`;
            markdown += `- **Alignement Personnel:** ${idea.evaluation.personalAlignment}/10\n`;
            markdown += `- **Faisabilité Technique:** ${idea.evaluation.technicalFeasibility}/10\n\n`;
        }

        if (idea.roadmapSteps) {
            markdown += `## Feuille de Route\n\n`;
            idea.roadmapSteps.forEach(step => {
                markdown += `- [${step.completed ? 'x' : ' '}] ${step.text}\n`;
            });
        }

        return markdown;
    };

    const generateJSON = (): string => {
        const exportData = {
            title: idea.title,
            status: idea.status,
            scores: {
                opportunity: idea.opportunityScore,
                feasibility: idea.feasibilityScore
            },
            analysis: idea.analysis,
            evaluation: idea.evaluation,
            roadmap: idea.roadmapSteps,
            createdAt: new Date(idea.createdAt).toISOString(),
            technologies: idea.evaluation?.recommendedTechnologies || [],
            databases: idea.evaluation?.recommendedDatabases || []
        };
        return JSON.stringify(exportData, null, 2);
    };

    const generateAIStudioPrompt = (): string => {
        let prompt = `# Prompt pour Google AI Studio / Gemini\n\n`;
        prompt += `## Contexte du Projet\n\n`;
        prompt += `**Titre:** ${idea.title}\n\n`;
        prompt += `**Description:** ${idea.analysis?.summary || idea.brainDump}\n\n`;
        
        if (idea.evaluation?.recommendedTechnologies) {
            prompt += `## Stack Technologique Recommandée\n\n`;
            idea.evaluation.recommendedTechnologies.forEach(tech => {
                prompt += `- **${tech.name}** (${tech.category}) - ${tech.reason}\n`;
            });
            prompt += `\n`;
        }

        if (idea.evaluation?.recommendedDatabases) {
            prompt += `## Bases de Données\n\n`;
            idea.evaluation.recommendedDatabases.forEach(db => {
                prompt += `- **${db.name}** - ${db.reason}\n`;
            });
            prompt += `\n`;
        }

        if (idea.roadmapSteps) {
            prompt += `## Feuille de Route - Étapes à Implémenter\n\n`;
            idea.roadmapSteps.forEach((step, index) => {
                prompt += `${index + 1}. ${step.text}\n`;
            });
            prompt += `\n`;
        }

        prompt += `## Instructions de Développement\n\n`;
        prompt += `Créez un prototype fonctionnel basé sur cette feuille de route. Utilisez les technologies recommandées pour construire un MVP. `;
        prompt += `Chaque étape de la roadmap doit être implémentée progressivement. `;
        prompt += `Assurez-vous que le code est propre, bien documenté et suit les meilleures pratiques pour ${idea.evaluation?.recommendedTechnologies?.find(t => t.category === 'Frontend')?.name || 'le framework choisi'}.\n\n`;
        prompt += `## Contraintes et Priorités\n\n`;
        prompt += `- Score de faisabilité: ${idea.feasibilityScore?.toFixed(1)}/10\n`;
        prompt += `- Focus sur un MVP minimal mais fonctionnel\n`;
        prompt += `- Prioriser la simplicité et la rapidité de déploiement\n`;

        return prompt;
    };

    const generateLovablePrompt = (): string => {
        let prompt = `Build a web application with the following specifications:\n\n`;
        prompt += `## Project Overview\n`;
        prompt += `${idea.analysis?.summary || idea.brainDump}\n\n`;
        
        prompt += `## Tech Stack\n`;
        if (idea.evaluation?.recommendedTechnologies) {
            const frontend = idea.evaluation.recommendedTechnologies.find(t => t.category === 'Frontend');
            const backend = idea.evaluation.recommendedTechnologies.find(t => t.category === 'Backend');
            prompt += `- Frontend: ${frontend?.name || 'React'}\n`;
            prompt += `- Backend: ${backend?.name || 'Node.js'}\n`;
            if (idea.evaluation.recommendedDatabases?.[0]) {
                prompt += `- Database: ${idea.evaluation.recommendedDatabases[0].name}\n`;
            }
            prompt += `\n`;
        }

        if (idea.roadmapSteps) {
            prompt += `## Features to Implement (in order)\n\n`;
            idea.roadmapSteps.forEach((step, index) => {
                prompt += `${index + 1}. ${step.text}\n`;
            });
        }

        prompt += `\n## Design Requirements\n`;
        prompt += `- Modern, clean UI\n`;
        prompt += `- Responsive design\n`;
        prompt += `- Accessible and user-friendly\n`;

        return prompt;
    };

    const generateV0Prompt = (): string => {
        let prompt = `${idea.title}\n\n`;
        prompt += `${idea.analysis?.summary || idea.brainDump}\n\n`;
        
        if (idea.roadmapSteps && idea.roadmapSteps.length > 0) {
            prompt += `Build this application step by step:\n\n`;
            idea.roadmapSteps.slice(0, 3).forEach((step, index) => {
                prompt += `${index + 1}. ${step.text}\n`;
            });
        }

        if (idea.evaluation?.recommendedTechnologies) {
            const techList = idea.evaluation.recommendedTechnologies
                .filter(t => ['Frontend', 'Backend'].includes(t.category))
                .map(t => t.name)
                .join(', ');
            if (techList) {
                prompt += `\nUse: ${techList}\n`;
            }
        }

        prompt += `\nCreate a modern, beautiful interface with smooth animations.`;

        return prompt;
    };

    const generateGitHubIssues = (): string => {
        let issues = '';
        
        // Créer une issue par étape de roadmap
        if (idea.roadmapSteps && idea.roadmapSteps.length > 0) {
            idea.roadmapSteps.forEach((step, index) => {
                issues += `## Issue #${index + 1}: ${step.text}\n\n`;
                issues += `### Description\n\n`;
                issues += `Cette étape fait partie de la feuille de route pour **${idea.title}**.\n\n`;
                
                if (idea.analysis?.summary) {
                    issues += `### Contexte\n\n`;
                    issues += `${idea.analysis.summary}\n\n`;
                }
                
                if (idea.evaluation?.recommendedTechnologies && index === 0) {
                    issues += `### Stack Technologique Recommandée\n\n`;
                    idea.evaluation.recommendedTechnologies.forEach(tech => {
                        issues += `- **${tech.name}** (${tech.category}) - ${tech.reason}\n`;
                    });
                    issues += `\n`;
                }
                
                // Ajouter des labels suggérés
                issues += `### Labels suggérés\n\n`;
                if (index < 3) {
                    issues += `- priority:high\n`;
                    issues += `- phase:validation\n`;
                } else if (index < idea.roadmapSteps.length - 2) {
                    issues += `- priority:medium\n`;
                    issues += `- phase:development\n`;
                } else {
                    issues += `- priority:low\n`;
                    issues += `- phase:optimization\n`;
                }
                
                issues += `\n---\n\n`;
            });
        }
        
        // Ajouter une issue de projet principal
        let projectIssue = `# Issue Projet: ${idea.title}\n\n`;
        projectIssue += `## Vue d'ensemble\n\n`;
        projectIssue += `${idea.analysis?.summary || idea.brainDump}\n\n`;
        
        if (idea.opportunityScore && idea.feasibilityScore) {
            projectIssue += `### Scores\n`;
            projectIssue += `- Opportunité: ${idea.opportunityScore.toFixed(1)}/10\n`;
            projectIssue += `- Faisabilité: ${idea.feasibilityScore.toFixed(1)}/10\n\n`;
        }
        
        if (idea.evaluation?.recommendedTechnologies) {
            projectIssue += `### Stack Recommandée\n\n`;
            idea.evaluation.recommendedTechnologies.forEach(tech => {
                projectIssue += `- ${tech.name} (${tech.category})\n`;
            });
            projectIssue += `\n`;
        }
        
        projectIssue += `### Roadmap\n\n`;
        projectIssue += `Cette roadmap contient ${idea.roadmapSteps?.length || 0} étapes. `;
        projectIssue += `Voir les issues individuelles pour les détails.\n\n`;
        
        projectIssue += `### Labels suggérés\n`;
        projectIssue += `- type:project\n`;
        projectIssue += `- status:planning\n`;
        
        return `# Issues GitHub à créer pour "${idea.title}"\n\n` +
               `Copiez-collez ce contenu dans des issues GitHub séparées.\n\n` +
               `---\n\n` +
               projectIssue +
               `\n---\n\n` +
               issues;
    };

    const generateProjectStarter = (): string => {
        const frontend = idea.evaluation?.recommendedTechnologies?.find(t => t.category === 'Frontend');
        const backend = idea.evaluation?.recommendedTechnologies?.find(t => t.category === 'Backend');
        const database = idea.evaluation?.recommendedDatabases?.[0];
        
        let starter = `# ${idea.title} - Template de Projet\n\n`;
        starter += `## 📋 Description\n\n`;
        starter += `${idea.analysis?.summary || idea.brainDump}\n\n`;
        
        starter += `## 🛠️ Stack Technologique\n\n`;
        if (frontend) starter += `- **Frontend:** ${frontend.name} - ${frontend.reason}\n`;
        if (backend) starter += `- **Backend:** ${backend.name} - ${backend.reason}\n`;
        if (database) starter += `- **Database:** ${database.name} - ${database.reason}\n`;
        starter += `\n`;
        
        starter += `## 🚀 Quick Start\n\n`;
        starter += `\`\`\`bash\n`;
        starter += `# Installation des dépendances\n`;
        starter += `npm install\n`;
        starter += `\n`;
        starter += `# Développement\n`;
        starter += `npm run dev\n`;
        starter += `\n`;
        starter += `# Build production\n`;
        starter += `npm run build\n`;
        starter += `\`\`\`\n\n`;
        
        starter += `## 📝 Roadmap\n\n`;
        if (idea.roadmapSteps) {
            idea.roadmapSteps.forEach((step, index) => {
                starter += `${index + 1}. [ ] ${step.text}\n`;
            });
        }
        
        starter += `\n## 📚 Ressources\n\n`;
        starter += `- Score d'opportunité: ${idea.opportunityScore?.toFixed(1) || 'N/A'}/10\n`;
        starter += `- Score de faisabilité: ${idea.feasibilityScore?.toFixed(1) || 'N/A'}/10\n`;
        
        if (idea.evaluation?.recommendedTechnologies) {
            starter += `\n### Technologies Recommandées\n\n`;
            idea.evaluation.recommendedTechnologies.forEach(tech => {
                starter += `- **${tech.name}** (${tech.category}) - Difficulté: ${tech.difficulty}\n`;
            });
        }
        
        return starter;
    };
    
    const handleCopy = () => {
        if (textAreaRef.current) {
            navigator.clipboard.writeText(textAreaRef.current.value).then(() => {
                setCopyButtonText('Copié !');
                setTimeout(() => setCopyButtonText('Copier dans le Presse-papiers'), 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                setCopyButtonText('Échec de la copie');
            });
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <Card 
                className="w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold">Exporter l'Idée</h2>
                    <Button onClick={onClose} variant="secondary">Fermer</Button>
                </div>

                {/* Sélecteur de format */}
                <div className="mb-4 flex-shrink-0">
                    <label className="block text-sm font-medium mb-2">Format d'export</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        <button
                            onClick={() => setExportFormat('markdown')}
                            className={`px-3 py-2 rounded-md text-sm transition-all ${
                                exportFormat === 'markdown'
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                        >
                            Markdown
                        </button>
                        <button
                            onClick={() => setExportFormat('json')}
                            className={`px-3 py-2 rounded-md text-sm transition-all ${
                                exportFormat === 'json'
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                        >
                            JSON
                        </button>
                        <button
                            onClick={() => setExportFormat('ai-studio-prompt')}
                            className={`px-3 py-2 rounded-md text-sm transition-all ${
                                exportFormat === 'ai-studio-prompt'
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                            title="Google AI Studio / Gemini"
                        >
                            AI Studio
                        </button>
                        <button
                            onClick={() => setExportFormat('lovable-prompt')}
                            className={`px-3 py-2 rounded-md text-sm transition-all ${
                                exportFormat === 'lovable-prompt'
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                            title="Lovable.dev"
                        >
                            Lovable
                        </button>
                        <button
                            onClick={() => setExportFormat('v0-prompt')}
                            className={`px-3 py-2 rounded-md text-sm transition-all ${
                                exportFormat === 'v0-prompt'
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                            title="v0.app (Vercel)"
                        >
                            v0.app
                        </button>
                        <button
                            onClick={() => setExportFormat('github-issues')}
                            className={`px-3 py-2 rounded-md text-sm transition-all ${
                                exportFormat === 'github-issues'
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                            title="Format GitHub Issues"
                        >
                            GitHub
                        </button>
                        <button
                            onClick={() => setExportFormat('project-starter')}
                            className={`px-3 py-2 rounded-md text-sm transition-all ${
                                exportFormat === 'project-starter'
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                            title="Template de projet README"
                        >
                            Starter
                        </button>
                    </div>
                </div>

                <textarea
                    ref={textAreaRef}
                    readOnly
                    className="w-full flex-grow p-4 bg-muted rounded-md border border-border resize-none font-mono text-sm"
                    value={generateContent()}
                />
                <div className="mt-4 flex gap-2 flex-shrink-0">
                    <Button onClick={handleCopy} className="flex-1">{copyButtonText}</Button>
                    {exportFormat === 'json' && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                const blob = new Blob([generateContent()], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${idea.title.replace(/\s+/g, '-').toLowerCase()}-roadmap.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        >
                            Télécharger JSON
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ExportModal;