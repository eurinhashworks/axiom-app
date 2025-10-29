import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeasContext';
import Card from '../components/ui/Card';
import IdeaCard from '../components/dashboard/IdeaCard';
import { Idea } from '../types';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { ideas, setActiveIdea } = useIdeas();

    const stats = useMemo(() => {
        const totalIdeas = ideas.length;
        const publicIdeas = ideas.filter(i => i.isPublic).length;
        const evaluatedIdeas = ideas.filter(i => i.status === 'EVALUATED' || i.status === 'ROADMAP_GENERATED').length;
        const roadmapsGenerated = ideas.filter(i => i.status === 'ROADMAP_GENERATED').length;
        
        // Calculer le pourcentage moyen de complétion des roadmaps
        const roadmapsWithSteps = ideas.filter(i => i.roadmapSteps && i.roadmapSteps.length > 0);
        const avgCompletion = roadmapsWithSteps.length > 0
            ? roadmapsWithSteps.reduce((sum, i) => {
                const completed = i.roadmapSteps!.filter(s => s.completed).length;
                const total = i.roadmapSteps!.length;
                return sum + (completed / total) * 100;
            }, 0) / roadmapsWithSteps.length
            : 0;

        // Score moyen opportunité et faisabilité
        const ideasWithScores = ideas.filter(i => i.opportunityScore !== undefined && i.feasibilityScore !== undefined);
        const avgOpportunity = ideasWithScores.length > 0
            ? ideasWithScores.reduce((sum, i) => sum + (i.opportunityScore || 0), 0) / ideasWithScores.length
            : 0;
        const avgFeasibility = ideasWithScores.length > 0
            ? ideasWithScores.reduce((sum, i) => sum + (i.feasibilityScore || 0), 0) / ideasWithScores.length
            : 0;

        return {
            totalIdeas,
            publicIdeas,
            evaluatedIdeas,
            roadmapsGenerated,
            avgCompletion: Math.round(avgCompletion),
            avgOpportunity: Number(avgOpportunity.toFixed(1)),
            avgFeasibility: Number(avgFeasibility.toFixed(1))
        };
    }, [ideas]);

    const publicIdeas = useMemo(() => {
        return ideas.filter(i => i.isPublic).sort((a, b) => b.createdAt - a.createdAt);
    }, [ideas]);

    if (!user) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* En-tête du profil */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {user.photoURL && (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'Utilisateur'}
                            className="w-20 h-20 rounded-full border-4 border-border"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{user.displayName || 'Utilisateur'}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        {user.metadata && user.metadata.creationTime && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Membre depuis {new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long'
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Statistiques */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Statistiques</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6">
                        <div className="text-3xl font-bold text-brand mb-1">{stats.totalIdeas}</div>
                        <div className="text-sm text-muted-foreground">Idées créées</div>
                    </Card>
                    <Card className="p-6">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.publicIdeas}</div>
                        <div className="text-sm text-muted-foreground">Idées publiques</div>
                    </Card>
                    <Card className="p-6">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.evaluatedIdeas}</div>
                        <div className="text-sm text-muted-foreground">Idées évaluées</div>
                    </Card>
                    <Card className="p-6">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{stats.roadmapsGenerated}</div>
                        <div className="text-sm text-muted-foreground">Roadmaps générées</div>
                    </Card>
                </div>
            </div>

            {/* Scores moyens */}
            {stats.avgOpportunity > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Performances Moyennes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-6">
                            <div className="text-sm text-muted-foreground mb-2">Score d'Opportunité Moyen</div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {stats.avgOpportunity}<span className="text-lg text-muted-foreground">/10</span>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="text-sm text-muted-foreground mb-2">Score de Faisabilité Moyen</div>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {stats.avgFeasibility}<span className="text-lg text-muted-foreground">/10</span>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="text-sm text-muted-foreground mb-2">Complétion Moyenne</div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {stats.avgCompletion}<span className="text-lg text-muted-foreground">%</span>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Idées publiques */}
            {publicIdeas.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Mes Idées Publiques</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {publicIdeas.map(idea => (
                            <IdeaCard key={idea.id} idea={idea} onSelect={() => setActiveIdea(idea)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;

