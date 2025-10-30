import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface SuperFocusModalProps {
    isOpen: boolean;
    onClose: () => void;
    stepTitle: string;
    tips?: string[];
    onComplete?: () => void;
}

const SuperFocusModal: React.FC<SuperFocusModalProps> = ({ isOpen, onClose, stepTitle, tips = [], onComplete }) => {
    const [secondsLeft, setSecondsLeft] = useState(25 * 60); // Pomodoro 25min
    const [running, setRunning] = useState(false);
    const [checklist, setChecklist] = useState<string[]>([]);
    const [newItem, setNewItem] = useState('');
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!running) return;
        timerRef.current = window.setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [running]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleAddItem = () => {
        const v = newItem.trim();
        if (!v) return;
        setChecklist((prev) => [...prev, v]);
        setNewItem('');
    };

    const handleReset = () => {
        setRunning(false);
        setSecondsLeft(25 * 60);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Mode Super Focus" size="large">
            <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Étape en cours</div>
                    <div className="text-lg font-semibold">{stepTitle}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 p-4 rounded-lg border border-border bg-background">
                        <div className="text-sm text-muted-foreground mb-2">Minuterie (25:00)</div>
                        <div className="text-4xl font-bold text-center mb-3">{formatTime(secondsLeft)}</div>
                        <div className="flex gap-2 justify-center">
                            <Button variant={running ? 'secondary' : 'primary'} onClick={() => setRunning((v) => !v)}>
                                {running ? 'Pause' : 'Démarrer'}
                            </Button>
                            <Button variant="secondary" onClick={handleReset}>Réinitialiser</Button>
                        </div>
                    </div>

                    <div className="md:col-span-2 p-4 rounded-lg border border-border bg-background">
                        <div className="text-sm text-muted-foreground mb-2">Checklist</div>
                        <div className="flex gap-2 mb-3">
                            <input
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Ajouter une sous-tâche…"
                                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                            />
                            <Button onClick={handleAddItem}>Ajouter</Button>
                        </div>
                        <ul className="space-y-2">
                            {checklist.length === 0 && (
                                <li className="text-sm text-muted-foreground">Aucune sous-tâche pour le moment.</li>
                            )}
                            {checklist.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <input type="checkbox" className="accent-brand" />
                                    <span className="text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {tips.length > 0 && (
                    <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="text-sm text-muted-foreground mb-2">Conseils</div>
                        <ul className="list-disc pl-5 space-y-1">
                            {tips.map((t, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{t}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                    {onComplete && (
                        <Button onClick={onComplete} className="order-2 sm:order-1">Marquer terminé</Button>
                    )}
                    <Button variant="secondary" onClick={onClose} className="order-1 sm:order-2">Fermer</Button>
                </div>
            </div>
        </Modal>
    );
};

export default SuperFocusModal;
