import { MapPin, FilterX } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="absolute bottom-24 left-4 right-4 z-10">
      <div className="bg-surface-900/95 backdrop-blur-sm border border-surface-700 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-surface-800 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-7 w-7 text-surface-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            No locations found
          </h3>
          
          <p className="text-sm text-surface-400 mb-4 max-w-xs">
            {hasFilters
              ? "Try adjusting your filters or search to see more results."
              : "Try zooming out or panning to a different area."}
          </p>
          
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-xl transition-colors"
            >
              <FilterX className="h-4 w-4" />
              <span className="text-sm font-medium">Clear all filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

