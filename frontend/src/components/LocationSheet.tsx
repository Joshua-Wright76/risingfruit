import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Navigation, Calendar, Lock, Leaf, ExternalLink, Share2, Check, Copy } from 'lucide-react';
import { getLocation } from '../lib/api';
import type { LocationDetail } from '../types/location';

interface LocationSheetProps {
  locationId: number | null;
  onClose: () => void;
}

function formatSeason(start: string | null, stop: string | null, noSeason: boolean): string {
  if (noSeason) return 'Year-round';
  if (!start && !stop) return 'Unknown';
  if (start && stop) return `${start} – ${stop}`;
  if (start) return `From ${start}`;
  return `Until ${stop}`;
}

function getDirectionsUrl(lat: number, lng: number): string {
  // Use Apple Maps on iOS, Google Maps elsewhere
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return `maps://maps.apple.com/?daddr=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function getAccessIcon(access: string | null) {
  if (!access) return null;
  const lower = access.toLowerCase();
  if (lower.includes('private')) {
    return <Lock className="h-4 w-4 text-accent-400" />;
  }
  return null;
}

export function LocationSheet({ locationId, onClose }: LocationSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  
  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => (locationId ? getLocation(locationId) : null),
    enabled: !!locationId,
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (locationId) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [locationId, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (locationId) {
      // Delay to prevent immediate close from marker click
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [locationId, onClose]);

  const isOpen = locationId !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-none ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-surface-900 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out border-t border-surface-700 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-surface-600 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-surface-400" />
        </button>

        {/* Content */}
        <div className="px-6 pb-8 pt-2 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400">Failed to load location details</p>
            </div>
          )}

          {location && <LocationContent location={location} />}
        </div>
      </div>
    </>
  );
}

function LocationContent({ location }: { location: LocationDetail }) {
  const primaryType = location.types[0];
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  const handleShare = useCallback(async () => {
    const shareData = {
      title: primaryType?.en_name || 'Foraging Location',
      text: location.description || `Found on Rising Fruit`,
      url: `${window.location.origin}?location=${location.id}`,
    };

    // Try Web Share API first (mobile)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        setShareStatus('shared');
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('copied');
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }

    // Reset status after 2 seconds
    setTimeout(() => setShareStatus('idle'), 2000);
  }, [location, primaryType]);
  
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-900/50 rounded-xl flex items-center justify-center">
          <Leaf className="h-6 w-6 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-surface-50 truncate">
            {primaryType?.en_name || 'Unknown Type'}
          </h2>
          {primaryType?.scientific_name && (
            <p className="text-sm text-surface-500 italic truncate">
              {primaryType.scientific_name}
            </p>
          )}
        </div>
        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-surface-800 transition-colors"
          aria-label="Share location"
        >
          {shareStatus === 'idle' && <Share2 className="h-5 w-5 text-surface-400" />}
          {shareStatus === 'copied' && <Copy className="h-5 w-5 text-primary-400" />}
          {shareStatus === 'shared' && <Check className="h-5 w-5 text-primary-400" />}
        </button>
      </div>

      {/* Description */}
      {location.description && (
        <p className="text-surface-300 leading-relaxed">
          {location.description}
        </p>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Season */}
        <div className="bg-surface-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary-400" />
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">Season</span>
          </div>
          <p className="text-sm font-medium text-surface-200">
            {formatSeason(location.season_start, location.season_stop, location.no_season)}
          </p>
        </div>

        {/* Access */}
        <div className="bg-surface-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            {getAccessIcon(location.access) || <Lock className="h-4 w-4 text-surface-500" />}
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">Access</span>
          </div>
          <p className="text-sm font-medium text-surface-200">
            {location.access || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Additional types */}
      {location.types.length > 1 && (
        <div>
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">Also contains</p>
          <div className="flex flex-wrap gap-2">
            {location.types.slice(1).map((type) => (
              <span
                key={type.id}
                className="px-3 py-1 bg-primary-900/50 text-primary-300 rounded-full text-sm border border-primary-800"
              >
                {type.en_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Verification status */}
      {location.unverified && (
        <div className="bg-accent-900/30 border border-accent-700 rounded-xl p-3">
          <p className="text-sm text-accent-300">
            ⚠️ This location has not been verified
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2">
        <a
          href={getDirectionsUrl(location.lat, location.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors"
        >
          <Navigation className="h-5 w-5" />
          Get Directions
          <ExternalLink className="h-4 w-4 opacity-70" />
        </a>
      </div>

      {/* Meta info */}
      {location.author && (
        <p className="text-xs text-surface-600 text-center">
          Added by {location.author}
        </p>
      )}
    </div>
  );
}
