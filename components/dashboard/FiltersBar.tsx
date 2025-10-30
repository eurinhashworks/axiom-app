import React from 'react';
import AdvancedFilters, { FilterState } from './AdvancedFilters';
import { Idea } from '../../types';

interface FiltersBarProps {
    ideas: Idea[];
    filters: FilterState;
    onFiltersChange: (f: FilterState) => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ ideas, filters, onFiltersChange }) => {
    return (
        <AdvancedFilters 
            ideas={ideas}
            onFiltersChange={onFiltersChange}
            onClearFilters={() => onFiltersChange({
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
            })}
        />
    );
};

export default FiltersBar;
