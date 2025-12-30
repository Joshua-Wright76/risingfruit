import { useState } from 'react';
import { ChevronDown, ChevronUp, Leaf, Flower2, Scissors, ShoppingBag, Calendar } from 'lucide-react';

export interface FilterState {
  categories: string[];
  inSeasonOnly: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CATEGORIES = [
  { id: 'forager', label: 'Forager', icon: Leaf, description: 'Edible plants' },
  { id: 'honeybee', label: 'Honeybee', icon: Flower2, description: 'Bee forage' },
  { id: 'grafter', label: 'Grafter', icon: Scissors, description: 'Grafting stock' },
  { id: 'freegan', label: 'Freegan', icon: ShoppingBag, description: 'Free food' },
] as const;

function getCurrentMonth(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleSeasonFilter = () => {
    onFilterChange({ ...filters, inSeasonOnly: !filters.inSeasonOnly });
  };

  const activeFilterCount = filters.categories.length + (filters.inSeasonOnly ? 1 : 0);

  return (
    <div className="bg-surface-900 rounded-2xl shadow-lg border border-surface-700 overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-surface-200">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-surface-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-surface-400" />
        )}
      </button>

      {/* Expanded panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-surface-700 pt-4">
          {/* Categories */}
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ id, label, icon: Icon }) => {
                const isActive = filters.categories.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleCategory(id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-900/50'
                        : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-surface-500'}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Season filter */}
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">
              Season
            </p>
            <button
              onClick={toggleSeasonFilter}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                filters.inSeasonOnly
                  ? 'bg-accent-600 text-white shadow-md shadow-accent-900/50'
                  : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
              }`}
            >
              <Calendar className={`h-5 w-5 ${filters.inSeasonOnly ? 'text-white' : 'text-surface-500'}`} />
              <div className="flex-1 text-left">
                <p>In season now</p>
                <p className={`text-xs ${filters.inSeasonOnly ? 'text-white/70' : 'text-surface-500'}`}>
                  Showing plants for {getCurrentMonth()}
                </p>
              </div>
            </button>
          </div>

          {/* Clear button */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFilterChange({ categories: [], inSeasonOnly: false })}
              className="w-full py-2 text-sm text-surface-500 hover:text-surface-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
