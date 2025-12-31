import { Leaf, Loader2 } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-20 bg-[var(--bg-primary)] flex flex-col animate-fade-in">
      {/* Header skeleton */}
      <div className="p-4 space-y-3">
        {/* Search bar skeleton */}
        <div className="h-12 skeleton rounded-2xl opacity-50" />
        {/* Filter bar skeleton */}
        <div className="h-12 skeleton rounded-2xl w-32 opacity-50" />
      </div>

      {/* Map area with loading indicator */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-20 w-20 text-[var(--accent-green)] animate-spin opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="h-10 w-10 text-[var(--accent-green)] animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-[var(--text-secondary)] text-sm font-semibold tracking-wide">INITIALIZING MAP...</p>
        </div>
      </div>

      {/* Bottom controls skeleton */}
      <div className="absolute bottom-6 right-4 space-y-2">
        <div className="w-11 h-11 skeleton rounded-xl opacity-30" />
        <div className="w-11 h-[88px] skeleton rounded-xl opacity-30" />
      </div>
    </div>
  );
}
