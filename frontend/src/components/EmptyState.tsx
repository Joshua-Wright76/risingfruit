import { MapPin, FilterX } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="absolute bottom-24 left-4 right-4 z-10 animate-slide-up">
      <div className="glass-elevated rounded-2xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-[var(--separator)] rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-7 w-7 text-[var(--text-tertiary)]" />
          </div>
          
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            No locations found
          </h3>
          
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs font-medium">
            {hasFilters
              ? "Try adjusting your filters or search to see more results."
              : "Try zooming out or panning to a different area."}
          </p>
          
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-green)] text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-green-500/20"
            >
              <FilterX className="h-4 w-4" />
              <span className="text-sm font-bold">Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
