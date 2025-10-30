import React from 'react';
import Button from '../ui/Button';

type SortOption = 'date-desc' | 'date-asc' | 'opportunity-desc' | 'opportunity-asc' | 'feasibility-desc' | 'feasibility-asc' | 'title-asc' | 'title-desc';

interface SortAndSelectBarProps {
    sortBy: SortOption;
    onSortChange: (v: SortOption) => void;
    totalCount: number;
    searchQuery?: string;
    allSelected: boolean;
    hasItems: boolean;
    onSelectAll: () => void;
}

const SortAndSelectBar: React.FC<SortAndSelectBarProps> = ({ sortBy, onSortChange, totalCount, searchQuery, allSelected, hasItems, onSelectAll }) => {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm min-w-[140px]"
                >
                    <option value="date-desc">Date (récent)</option>
                    <option value="date-asc">Date (ancien)</option>
                    <option value="title-asc">Titre (A-Z)</option>
                    <option value="title-desc">Titre (Z-A)</option>
                    <option value="opportunity-desc">Opportunité (haut)</option>
                    <option value="opportunity-asc">Opportunité (bas)</option>
                    <option value="feasibility-desc">Faisabilité (haut)</option>
                    <option value="feasibility-asc">Faisabilité (bas)</option>
                </select>

                {hasItems && (
                    <Button
                        variant="secondary"
                        onClick={onSelectAll}
                        className="text-sm w-full sm:w-auto flex-1 sm:flex-initial"
                    >
                        <span className="hidden sm:inline">
                            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </span>
                        <span className="sm:hidden">
                            {allSelected ? 'Désélectionner' : 'Sélectionner'}
                        </span>
                    </Button>
                )}
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {totalCount} idée(s)
                {searchQuery && (
                    <span className="hidden sm:inline"> trouvée(s) pour "{searchQuery}"</span>
                )}
            </div>
        </div>
    );
};

export default SortAndSelectBar;


