import React, { createContext, useContext, ReactNode } from 'react';
import { Idea } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface IdeasContextType {
    ideas: Idea[];
    addIdea: (title: string) => Idea;
    updateIdea: (id: string, updates: Partial<Idea>) => void;
    deleteIdea: (id: string) => void;
    activeIdea: Idea | null;
    setActiveIdea: (idea: Idea | null) => void;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export const IdeasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ideas, setIdeas] = useLocalStorage<Idea[]>('axiom-flow-ideas', []);
    const [activeIdeaId, setActiveIdeaId] = useLocalStorage<string | null>('axiom-flow-active-idea', null);

    const addIdea = (title: string): Idea => {
        const newIdea: Idea = {
            id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            status: 'DRAFT',
            brainDump: '',
            createdAt: Date.now(),
        };
        setIdeas(prev => [...prev, newIdea].sort((a, b) => b.createdAt - a.createdAt));
        setActiveIdeaId(newIdea.id);
        return newIdea;
    };

    const updateIdea = (id: string, updates: Partial<Idea>) => {
        setIdeas(prev => prev.map(idea => (idea.id === id ? { ...idea, ...updates } : idea)));
    };

    const deleteIdea = (id: string) => {
        if (activeIdeaId === id) {
            setActiveIdeaId(null);
        }
        setIdeas(prev => prev.filter(idea => idea.id !== id));
    };

    const setActiveIdea = (idea: Idea | null) => {
        setActiveIdeaId(idea ? idea.id : null);
    };

    const activeIdea = ideas.find(idea => idea.id === activeIdeaId) || null;

    return (
        <IdeasContext.Provider value={{ ideas, addIdea, updateIdea, deleteIdea, activeIdea, setActiveIdea }}>
            {children}
        </IdeasContext.Provider>
    );
};

export const useIdeas = (): IdeasContextType => {
    const context = useContext(IdeasContext);
    if (!context) {
        throw new Error('useIdeas must be used within an IdeasProvider');
    }
    return context;
};
