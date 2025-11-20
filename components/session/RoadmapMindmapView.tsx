import React, { useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import { Idea, RoadmapStep } from '../../types';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

// Lazy load ReactFlow pour réduire le bundle initial
const ReactFlow = lazy(() => import('reactflow').then(module => ({ default: module.default })));
const Controls = lazy(() => import('reactflow').then(module => ({ default: module.Controls })));
const Background = lazy(() => import('reactflow').then(module => ({ default: module.Background })));

// Import CSS de ReactFlow - nécessaire pour le style
// Utilisation d'un import conditionnel pour éviter l'erreur TypeScript
if (typeof window !== 'undefined') {
    // @ts-expect-error - Import CSS dynamique, géré par Vite
    import('reactflow/dist/style.css');
}

interface RoadmapMindmapViewProps {
    idea: Idea;
    onStepToggle?: (index: number) => void;
}

const RoadmapMindmapView: React.FC<RoadmapMindmapViewProps> = React.memo(({ idea, onStepToggle }) => {
    if (!idea.roadmapSteps || idea.roadmapSteps.length === 0) {
        return null;
    }

    // Configuration des couleurs selon le statut - memoized
    const getNodeColor = useCallback((step: RoadmapStep, index: number) => {
        if (step.completed) {
            return {
                background: '#10b981', // green-500
                border: '#059669', // green-600
                text: '#ffffff',
            };
        }
        // Dégradé selon la position dans la roadmap
        const hue = 210 + (index * 15); // De bleu à violet
        return {
            background: `hsl(${hue}, 70%, 50%)`,
            border: `hsl(${hue}, 70%, 40%)`,
            text: '#ffffff',
        };
    }, []);

    // Création initiale des noeuds et arêtes pour la mindmap
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const ideaNode: Node = {
            id: 'idea-root',
            type: 'default',
            position: { x: 0, y: 0 },
            data: {
                label: (
                    <div className="text-center p-2">
                        <div className="font-bold text-lg">{idea.title || 'Idée'}</div>
                        <div className="text-xs opacity-80 mt-1">Feuille de Route</div>
                    </div>
                ),
            },
            style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: '3px solid #764ba2',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                width: 200,
                height: 100,
            },
        };

        const stepNodes: Node[] = idea.roadmapSteps.map((step, index) => {
            const colors = getNodeColor(step, index);
            const angle = (index * 360) / idea.roadmapSteps.length;
            const radius = 250;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return {
                id: `step-${index}`,
                type: 'default',
                position: { x, y },
                data: {
                    label: (
                        <div 
                            className="p-3 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => onStepToggle && onStepToggle(index)}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    step.completed 
                                        ? 'bg-green-500 border-green-600' 
                                        : 'bg-transparent border-current'
                                }`}>
                                    {step.completed && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className="font-semibold text-xs">Étape {index + 1}</span>
                            </div>
                            <div className={`text-sm leading-relaxed ${step.completed ? 'line-through opacity-70' : ''}`}>
                                {step.text}
                            </div>
                        </div>
                    ),
                },
                style: {
                    background: colors.background,
                    color: colors.text,
                    border: `2px solid ${colors.border}`,
                    borderRadius: '10px',
                    fontSize: '12px',
                    width: 220,
                    minHeight: 100,
                    cursor: 'pointer',
                },
            };
        });

        const stepEdges: Edge[] = idea.roadmapSteps.map((step, index) => ({
            id: `edge-${index}`,
            source: 'idea-root',
            target: `step-${index}`,
            type: 'smoothstep',
            animated: !step.completed,
            style: {
                stroke: step.completed ? '#10b981' : '#6366f1',
                strokeWidth: step.completed ? 3 : 2,
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: step.completed ? '#10b981' : '#6366f1',
            },
        }));

        return {
            nodes: [ideaNode, ...stepNodes],
            edges: stepEdges,
        };
    }, [idea.roadmapSteps, idea.title, onStepToggle]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Mettre à jour les noeuds quand les étapes changent
    useEffect(() => {
        const ideaNode: Node = {
            id: 'idea-root',
            type: 'default',
            position: { x: 0, y: 0 },
            data: {
                label: (
                    <div className="text-center p-2">
                        <div className="font-bold text-lg">{idea.title || 'Idée'}</div>
                        <div className="text-xs opacity-80 mt-1">Feuille de Route</div>
                    </div>
                ),
            },
            style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: '3px solid #764ba2',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                width: 200,
                height: 100,
            },
        };

        const stepNodes: Node[] = idea.roadmapSteps!.map((step, index) => {
            const colors = getNodeColor(step, index);
            const angle = (index * 360) / idea.roadmapSteps!.length;
            const radius = 250;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return {
                id: `step-${index}`,
                type: 'default',
                position: { x, y },
                data: {
                    label: (
                        <div 
                            className="p-3 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => onStepToggle && onStepToggle(index)}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    step.completed 
                                        ? 'bg-green-500 border-green-600' 
                                        : 'bg-transparent border-current'
                                }`}>
                                    {step.completed && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className="font-semibold text-xs">Étape {index + 1}</span>
                            </div>
                            <div className={`text-sm leading-relaxed ${step.completed ? 'line-through opacity-70' : ''}`}>
                                {step.text}
                            </div>
                        </div>
                    ),
                },
                style: {
                    background: colors.background,
                    color: colors.text,
                    border: `2px solid ${colors.border}`,
                    borderRadius: '10px',
                    fontSize: '12px',
                    width: 220,
                    minHeight: 100,
                    cursor: 'pointer',
                },
            };
        });

        const stepEdges: Edge[] = idea.roadmapSteps!.map((step, index) => ({
            id: `edge-${index}`,
            source: 'idea-root',
            target: `step-${index}`,
            type: 'smoothstep',
            animated: !step.completed,
            style: {
                stroke: step.completed ? '#10b981' : '#6366f1',
                strokeWidth: step.completed ? 3 : 2,
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: step.completed ? '#10b981' : '#6366f1',
            },
        }));

        setNodes([ideaNode, ...stepNodes]);
        setEdges(stepEdges);
    }, [idea.roadmapSteps, idea.title, onStepToggle, setNodes, setEdges]);

    return (
        <Card className="overflow-hidden p-0">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Roadmap Visuelle (Mindmap)</h3>
                    <div className="text-sm text-muted-foreground">
                        {useMemo(() => {
                            return idea.roadmapSteps.filter(s => s.completed).length;
                        }, [idea.roadmapSteps])} / {idea.roadmapSteps.length} complétées
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', height: '600px' }} className="bg-muted/20">
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                        <Spinner />
                    </div>
                }>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            animated: true,
                        }}
                    >
                        <Suspense fallback={null}>
                            <Background />
                            <Controls />
                        </Suspense>
                    </ReactFlow>
                </Suspense>
            </div>
            <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                    💡 Cliquez sur une étape pour la marquer comme complétée. Les étapes complétées sont en vert.
                </p>
            </div>
        </Card>
    );
});

RoadmapMindmapView.displayName = 'RoadmapMindmapView';

export default RoadmapMindmapView;
