import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Step } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface QuickRoadmapCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const QuickRoadmapCreator: React.FC<QuickRoadmapCreatorProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goals, setGoals] = useState<string[]>(['']);
    const [steps, setSteps] = useState<Array<Partial<Step>>>([]);
    const [isSaving, setIsSaving] = useState(false);

    const addGoal = () => setGoals([...goals, '']);
    const removeGoal = (idx: number) => setGoals(goals.filter((_, i) => i !== idx));

    const addStep = () => setSteps([...steps, { title: '', estimateMinutes: 30, difficulty: 'medium', order: steps.length }]);
    const updateStep = (idx: number, updates: Partial<Step>) => {
        const s = [...steps];
        s[idx] = { ...s[idx], ...updates };
        setSteps(s);
    };
    const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));

    const handleSave = async () => {
        if (!title.trim() || steps.length === 0 || !user) return;
        setIsSaving(true);
        try {
            const roadmapId = await firebaseService.createRoadmap(user.uid, {
                title: title.trim(),
                description: description.trim() || undefined,
                goals: goals.filter(g => g.trim()).length > 0 ? goals.filter(g => g.trim()) : undefined
            });
            
            for (const step of steps) {
                if (step.title?.trim()) {
                    await firebaseService.createStep({
                        roadmapId,
                        title: step.title.trim(),
                        description: step.description?.trim(),
                        prerequisites: step.prerequisites,
                        estimateMinutes: step.estimateMinutes,
                        difficulty: step.difficulty,
                        tips: step.tips,
                        proofOfProgress: step.proofOfProgress,
                        order: step.order
                    });
                }
            }
            
            showToast('Roadmap créée avec succès !', 'success');
            setIsSaving(false);
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            showToast('Erreur lors de la création de la roadmap', 'error');
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Créer une roadmap" size="large">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium mb-1">Titre de la roadmap *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Créer une application web"
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez votre projet..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Objectifs</label>
                    {goals.map((g, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={g}
                                onChange={(e) => {
                                    const g2 = [...goals];
                                    g2[i] = e.target.value;
                                    setGoals(g2);
                                }}
                                placeholder={`Objectif ${i + 1}`}
                                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                            />
                            {goals.length > 1 && (
                                <Button variant="secondary" onClick={() => removeGoal(i)} className="text-sm px-3">×</Button>
                            )}
                        </div>
                    ))}
                    <Button variant="secondary" onClick={addGoal} className="text-sm">+ Ajouter un objectif</Button>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Étapes *</label>
                        <Button variant="secondary" onClick={addStep} className="text-sm">+ Ajouter une étape</Button>
                    </div>
                    {steps.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-4 border border-dashed border-border rounded-md text-center">
                            Aucune étape. Cliquez sur "+ Ajouter une étape" pour commencer.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {steps.map((step, idx) => (
                                <div key={idx} className="p-4 border border-border rounded-md bg-muted/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Étape {idx + 1}</span>
                                        <Button variant="secondary" onClick={() => removeStep(idx)} className="text-xs px-2">Supprimer</Button>
                                    </div>
                                    <input
                                        type="text"
                                        value={step.title || ''}
                                        onChange={(e) => updateStep(idx, { title: e.target.value })}
                                        placeholder="Titre de l'étape"
                                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm mb-2"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">Durée (min)</label>
                                            <input
                                                type="number"
                                                value={step.estimateMinutes || 30}
                                                onChange={(e) => updateStep(idx, { estimateMinutes: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">Difficulté</label>
                                            <select
                                                value={step.difficulty || 'medium'}
                                                onChange={(e) => updateStep(idx, { difficulty: e.target.value as 'easy'|'medium'|'hard' })}
                                                className="w-full px-2 py-1 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                                            >
                                                <option value="easy">Facile</option>
                                                <option value="medium">Moyen</option>
                                                <option value="hard">Difficile</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>Annuler</Button>
                    <Button onClick={handleSave} disabled={!title.trim() || steps.length === 0 || isSaving} isLoading={isSaving}>
                        Créer la roadmap
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuickRoadmapCreator;
