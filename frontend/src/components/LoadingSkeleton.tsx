import { Leaf } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-20 bg-surface-950 flex flex-col">
      {/* Header skeleton */}
      <div className="p-4 space-y-3">
        {/* Search bar skeleton */}
        <div className="h-12 skeleton rounded-2xl" />
        {/* Filter bar skeleton */}
        <div className="h-12 skeleton rounded-2xl w-32" />
      </div>

      {/* Map area with loading indicator */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Leaf className="h-16 w-16 text-primary-500 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
            </div>
          </div>
          <p className="mt-6 text-surface-400 text-sm font-medium">Loading map...</p>
        </div>
      </div>

      {/* Bottom controls skeleton */}
      <div className="absolute bottom-6 right-4 space-y-2">
        <div className="w-11 h-11 skeleton rounded-lg" />
        <div className="w-11 h-[88px] skeleton rounded-lg" />
      </div>
    </div>
  );
}

