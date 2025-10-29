import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Idea } from '../types';
import { useAuth } from './AuthContext';
import { firebaseService } from '../services/firebaseService';
import { useToast } from '../contexts/ToastContext';
import { handleFirebaseError } from '../utils/errorHandler';

interface IdeasContextType {
    ideas: Idea[];
    addIdea: (title: string) => Promise<Idea>;
    updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
    deleteIdea: (id: string) => Promise<void>;
    activeIdea: Idea | null;
    setActiveIdea: (idea: Idea | null) => void;
    loading: boolean;
    syncing: boolean;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export const IdeasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [hasMigrated, setHasMigrated] = useState(false);

    // Migration depuis localStorage vers Firebase
    useEffect(() => {
        if (!user || hasMigrated) return;

        const migrateFromLocalStorage = async () => {
            try {
                const localStorageIdeas = localStorage.getItem('axiom-flow-ideas');
                const localStorageActiveId = localStorage.getItem('axiom-flow-active-idea');
                
                if (localStorageIdeas) {
                    const oldIdeas: Idea[] = JSON.parse(localStorageIdeas);
                    if (oldIdeas.length > 0) {
                        setSyncing(true);
                        // Migrer les idées vers Firebase
                        for (const idea of oldIdeas) {
                            await firebaseService.saveIdea(idea, user.uid, {
                                displayName: user.displayName,
                                photoURL: user.photoURL
                            });
                        }
                        showToast(`${oldIdeas.length} idée(s) migrée(s) depuis localStorage`, 'success');
                        // Nettoyer localStorage
                        localStorage.removeItem('axiom-flow-ideas');
                        if (localStorageActiveId) {
                            localStorage.removeItem('axiom-flow-active-idea');
                        }
                    }
                }
                setHasMigrated(true);
        } catch (error) {
            const errorInfo = handleFirebaseError(error);
            console.error('Error migrating from localStorage:', error);
            showToast(errorInfo.message, 'error');
            } finally {
                setSyncing(false);
            }
        };

        migrateFromLocalStorage();
    }, [user, hasMigrated, showToast]);

    // Souscrire aux idées en temps réel
    useEffect(() => {
        if (!user) {
            setIdeas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = firebaseService.subscribeToIdeas(user.uid, (firebaseIdeas) => {
            setIdeas(firebaseIdeas);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addIdea = useCallback(async (title: string): Promise<Idea> => {
        if (!user) {
            throw new Error('User must be authenticated to add ideas');
        }

        const newIdea: Idea = {
            id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            status: 'DRAFT',
            brainDump: '',
            createdAt: Date.now(),
            isPublic: false
        };

        try {
            setSyncing(true);
            const ideaId = await firebaseService.saveIdea(newIdea, user.uid, {
                displayName: user.displayName,
                photoURL: user.photoURL
            });
            const savedIdea = { ...newIdea, id: ideaId };
            setActiveIdeaId(ideaId);
            return savedIdea;
        } catch (error) {
            const errorInfo = handleFirebaseError(error);
            console.error('Error adding idea:', error);
            showToast(errorInfo.message, 'error');
            throw error;
        } finally {
            setSyncing(false);
        }
    }, [user, showToast]);

    const updateIdea = useCallback(async (id: string, updates: Partial<Idea>): Promise<void> => {
        if (!user) {
            throw new Error('User must be authenticated to update ideas');
        }

        const ideaToUpdate = ideas.find(i => i.id === id);
        if (!ideaToUpdate) {
            throw new Error('Idea not found');
        }

        try {
            setSyncing(true);
            const updatedIdea = { ...ideaToUpdate, ...updates };
            await firebaseService.saveIdea(updatedIdea, user.uid, {
                displayName: user.displayName,
                photoURL: user.photoURL
            });
        } catch (error) {
            const errorInfo = handleFirebaseError(error);
            console.error('Error updating idea:', error);
            showToast(errorInfo.message, 'error');
            throw error;
        } finally {
            setSyncing(false);
        }
    }, [user, ideas, showToast]);

    const deleteIdea = useCallback(async (id: string): Promise<void> => {
        if (!user) {
            throw new Error('User must be authenticated to delete ideas');
        }

        try {
            setSyncing(true);
            await firebaseService.deleteIdea(id);
            if (activeIdeaId === id) {
                setActiveIdeaId(null);
            }
            showToast('Idée supprimée avec succès', 'success');
        } catch (error) {
            const errorInfo = handleFirebaseError(error);
            console.error('Error deleting idea:', error);
            showToast(errorInfo.message, 'error');
            throw error;
        } finally {
            setSyncing(false);
        }
    }, [user, activeIdeaId, showToast]);

    const setActiveIdea = (idea: Idea | null) => {
        setActiveIdeaId(idea ? idea.id : null);
    };

    const activeIdea = ideas.find(idea => idea.id === activeIdeaId) || null;

    return (
        <IdeasContext.Provider value={{ 
            ideas, 
            addIdea, 
            updateIdea, 
            deleteIdea, 
            activeIdea, 
            setActiveIdea,
            loading,
            syncing
        }}>
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
