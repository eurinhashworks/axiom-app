import React, { useState } from 'react';
import { Idea, IdeaStatus } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AdvancedFiltersProps {
    ideas: Idea[];
    onFiltersChange: (filters: FilterState) => void;
    onClearFilters: () => void;
}

export interface FilterState {
    status: 'all' | IdeaStatus;
    minOpportunity: number;
    maxOpportunity: number;
    minFeasibility: number;
    maxFeasibility: number;
    technologies: string[];
    tags: string[];
    dateRange: {
        start: string;
        end: string;
    };
    hasRoadmap: boolean | null;
    hasAnalysis: boolean | null;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ ideas, onFiltersChange, onClearFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        minOpportunity: 0,
        maxOpportunity: 10,
        minFeasibility: 0,
        maxFeasibility: 10,
        technologies: [],
        tags: [],
        dateRange: { start: '', end: '' },
        hasRoadmap: null,
        hasAnalysis: null
    });

    // Extraire les technologies uniques des idées
    const availableTechnologies = Array.from(new Set(
        ideas
            .flatMap(idea => [
                ...(idea.evaluation?.recommendedTechnologies || []).map(t => t.name),
                ...(idea.evaluation?.recommendedDatabases || []).map(t => t.name)
            ])
            .filter(Boolean)
    )).sort();

    // Extraire les tags uniques (pour l'instant basé sur les catégories de technologies)
    const availableTags = Array.from(new Set(
        ideas
            .flatMap(idea => [
                ...(idea.evaluation?.recommendedTechnologies || []).map(t => t.category),
                ...(idea.evaluation?.recommendedDatabases || []).map(t => t.category)
            ])
            .filter(Boolean)
    )).sort();

    const updateFilter = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters: FilterState = {
            status: 'all',
            minOpportunity: 0,
            maxOpportunity: 10,
            minFeasibility: 0,
            maxFeasibility: 10,
            technologies: [],
            tags: [],
            dateRange: { start: '', end: '' },
            hasRoadmap: null,
            hasAnalysis: null
        };
        setFilters(clearedFilters);
        onClearFilters();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.status !== 'all') count++;
        if (filters.minOpportunity > 0 || filters.maxOpportunity < 10) count++;
        if (filters.minFeasibility > 0 || filters.maxFeasibility < 10) count++;
        if (filters.technologies.length > 0) count++;
        if (filters.tags.length > 0) count++;
        if (filters.dateRange.start || filters.dateRange.end) count++;
        if (filters.hasRoadmap !== null) count++;
        if (filters.hasAnalysis !== null) count++;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <div className="relative">
            <Button
                variant="secondary"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filtres avancés
                {activeFiltersCount > 0 && (
                    <span className="bg-brand text-white text-xs rounded-full px-2 py-0.5">
                        {activeFiltersCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <Card className="absolute top-full left-0 mt-2 w-screen sm:w-96 max-w-[calc(100vw-2rem)] z-50 max-h-[80vh] overflow-y-auto shadow-xl">
                    <div className="space-y-6 p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Filtres avancés</h3>
                            <div className="flex gap-2">
                                {activeFiltersCount > 0 && (
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={handleClearFilters}
                                        className="text-xs"
                                    >
                                        Effacer
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs"
                                >
                                    Fermer
                                </Button>
                            </div>
                        </div>

                        {/* Statut */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Statut</label>
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="DRAFT">Brouillon</option>
                                <option value="ANALYZING">En analyse</option>
                                <option value="ANALYZED">Analysé</option>
                                <option value="EVALUATED">Évalué</option>
                                <option value="ROADMAP_GENERATED">Roadmap générée</option>
                            </select>
                        </div>

                        {/* Score d'opportunité */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Score d'opportunité: {filters.minOpportunity} - {filters.maxOpportunity}
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={filters.minOpportunity}
                                    onChange={(e) => updateFilter('minOpportunity', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={filters.maxOpportunity}
                                    onChange={(e) => updateFilter('maxOpportunity', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Score de faisabilité */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Score de faisabilité: {filters.minFeasibility} - {filters.maxFeasibility}
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={filters.minFeasibility}
                                    onChange={(e) => updateFilter('minFeasibility', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={filters.maxFeasibility}
                                    onChange={(e) => updateFilter('maxFeasibility', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Technologies */}
                        {availableTechnologies.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Technologies</label>
                                <div className="space-y-2 max-h-32 overflow-y-auto overscroll-contain">
                                    {availableTechnologies.map(tech => (
                                        <label key={tech} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.technologies.includes(tech)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        updateFilter('technologies', [...filters.technologies, tech]);
                                                    } else {
                                                        updateFilter('technologies', filters.technologies.filter(t => t !== tech));
                                                    }
                                                }}
                                                className="rounded border-border"
                                            />
                                            <span className="text-sm">{tech}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {availableTags.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Catégories</label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {availableTags.map(tag => (
                                        <label key={tag} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.tags.includes(tag)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        updateFilter('tags', [...filters.tags, tag]);
                                                    } else {
                                                        updateFilter('tags', filters.tags.filter(t => t !== tag));
                                                    }
                                                }}
                                                className="rounded border-border"
                                            />
                                            <span className="text-sm">{tag}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Plage de dates */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Période</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                                    className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                                />
                                <input
                                    type="date"
                                    value={filters.dateRange.end}
                                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                                    className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                                />
                            </div>
                        </div>

                        {/* Filtres booléens */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">Contenu</label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="hasAnalysis"
                                            checked={filters.hasAnalysis === null}
                                            onChange={() => updateFilter('hasAnalysis', null)}
                                            className="border-border"
                                        />
                                        <span className="text-sm">Toutes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="hasAnalysis"
                                            checked={filters.hasAnalysis === true}
                                            onChange={() => updateFilter('hasAnalysis', true)}
                                            className="border-border"
                                        />
                                        <span className="text-sm">Avec analyse</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="hasAnalysis"
                                            checked={filters.hasAnalysis === false}
                                            onChange={() => updateFilter('hasAnalysis', false)}
                                            className="border-border"
                                        />
                                        <span className="text-sm">Sans analyse</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Roadmap</label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="hasRoadmap"
                                            checked={filters.hasRoadmap === null}
                                            onChange={() => updateFilter('hasRoadmap', null)}
                                            className="border-border"
                                        />
                                        <span className="text-sm">Toutes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="hasRoadmap"
                                            checked={filters.hasRoadmap === true}
                                            onChange={() => updateFilter('hasRoadmap', true)}
                                            className="border-border"
                                        />
                                        <span className="text-sm">Avec roadmap</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="hasRoadmap"
                                            checked={filters.hasRoadmap === false}
                                            onChange={() => updateFilter('hasRoadmap', false)}
                                            className="border-border"
                                        />
                                        <span className="text-sm">Sans roadmap</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdvancedFilters;
