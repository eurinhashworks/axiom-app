import React, { useState } from 'react';
import { Idea, TechRecommendation } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface TechComparisonModalProps {
    idea: Idea;
    isOpen: boolean;
    onClose: () => void;
}

const TechComparisonModal: React.FC<TechComparisonModalProps> = ({ idea, isOpen, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('Frontend');
    
    if (!idea.evaluation?.recommendedTechnologies && !idea.evaluation?.recommendedDatabases) {
        return null;
    }

    const allTech = [
        ...(idea.evaluation.recommendedTechnologies || []),
        ...(idea.evaluation.recommendedDatabases || [])
    ];

    const categories = Array.from(new Set(allTech.map(t => t.category)));

    const techByCategory = allTech.filter(t => t.category === selectedCategory);

    // Données de comparaison simplifiées (pourrait être enrichi avec API)
    const getComparisonData = (tech: TechRecommendation) => {
        const comparisons: Record<string, any> = {
            'React': {
                learningCurve: 'Moyen',
                community: 'Très grande',
                performance: 'Excellent',
                ecosystem: 'Très riche'
            },
            'Vue.js': {
                learningCurve: 'Facile',
                community: 'Grande',
                performance: 'Excellent',
                ecosystem: 'Riche'
            },
            'Next.js': {
                learningCurve: 'Moyen',
                community: 'Grande',
                performance: 'Excellent',
                ecosystem: 'Riche'
            },
            'Node.js': {
                learningCurve: 'Moyen',
                community: 'Très grande',
                performance: 'Excellent',
                ecosystem: 'Très riche'
            },
            'Python': {
                learningCurve: 'Facile',
                community: 'Très grande',
                performance: 'Bon',
                ecosystem: 'Très riche'
            },
            'PostgreSQL': {
                learningCurve: 'Moyen',
                community: 'Grande',
                performance: 'Excellent',
                ecosystem: 'Riche'
            },
            'MongoDB': {
                learningCurve: 'Facile',
                community: 'Grande',
                performance: 'Excellent',
                ecosystem: 'Riche'
            },
            'Firebase': {
                learningCurve: 'Facile',
                community: 'Grande',
                performance: 'Bon',
                ecosystem: 'Intégré'
            },
            'AWS': {
                learningCurve: 'Difficile',
                community: 'Très grande',
                performance: 'Excellent',
                ecosystem: 'Très riche'
            },
            'Vercel': {
                learningCurve: 'Facile',
                community: 'Grande',
                performance: 'Excellent',
                ecosystem: 'Intégré'
            }
        };

        return comparisons[tech.name] || {
            learningCurve: '-',
            community: '-',
            performance: '-',
            ecosystem: '-'
        };
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Comparaison des Technologies" size="large">
            <div className="space-y-4 sm:space-y-6">
                {/* Sélecteur de catégorie */}
                <div className="flex gap-2 flex-wrap">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm transition-all flex-1 sm:flex-initial ${
                                selectedCategory === category
                                    ? 'bg-brand text-white'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Comparaison */}
                {techByCategory.length > 0 ? (
                    <div className="overflow-x-auto -mx-1">
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm">Technologie</th>
                                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm hidden sm:table-cell">Courbe d'apprentissage</th>
                                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm hidden md:table-cell">Communauté</th>
                                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm hidden md:table-cell">Performance</th>
                                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm hidden lg:table-cell">Ecosystème</th>
                                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm">Difficulté</th>
                                </tr>
                            </thead>
                            <tbody>
                                {techByCategory.map((tech, index) => {
                                    const comparison = getComparisonData(tech);
                                    return (
                                        <tr key={index} className="border-b border-border hover:bg-muted/50">
                                            <td className="p-2 sm:p-3">
                                                <div>
                                                    <div className="font-semibold text-brand text-sm sm:text-base">{tech.name}</div>
                                                    <div className="text-xs text-muted-foreground hidden sm:block">{tech.reason}</div>
                                                    <div className="text-xs text-muted-foreground sm:hidden truncate max-w-[150px]">{tech.reason}</div>
                                                </div>
                                            </td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm hidden sm:table-cell">{comparison.learningCurve}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm hidden md:table-cell">{comparison.community}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm hidden md:table-cell">{comparison.performance}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm hidden lg:table-cell">{comparison.ecosystem}</td>
                                            <td className="p-2 sm:p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    tech.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    tech.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {tech.difficulty === 'easy' ? 'Facile' : tech.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Card>
                        <p className="text-muted-foreground text-center py-8">
                            Aucune technologie dans la catégorie "{selectedCategory}"
                        </p>
                    </Card>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose}>
                        Fermer
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default TechComparisonModal;

