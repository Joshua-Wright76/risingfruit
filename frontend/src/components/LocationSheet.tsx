import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Navigation, Calendar, Lock, Leaf, ExternalLink, Share2, Check, Copy } from 'lucide-react';
import { getLocation } from '../lib/api';
import { getFallbackSeason, formatFallbackSeason } from '../lib/fruitSeasons';
import type { LocationDetail } from '../types/location';

interface LocationSheetProps {
  locationId: number | null;
  onClose: () => void;
}

interface SeasonInfo {
  text: string;
  isFallback: boolean;
}

function formatSeason(start: string | null, stop: string | null, noSeason: boolean, typeIds: number[]): SeasonInfo {
  if (noSeason) return { text: 'Year-round', isFallback: false };
  
  if (start || stop) {
    if (start && stop) return { text: `${start} – ${stop}`, isFallback: false };
    if (start) return { text: `From ${start}`, isFallback: false };
    return { text: `Until ${stop}`, isFallback: false };
  }
  
  // Try to get fallback season based on plant type
  const fallbackSeason = getFallbackSeason(typeIds);
  if (fallbackSeason) {
    return { text: formatFallbackSeason(fallbackSeason), isFallback: true };
  }
  
  return { text: 'Unknown', isFallback: false };
}

function getDirectionsUrl(lat: number, lng: number): string {
  // Use Apple Maps on iOS, Google Maps elsewhere
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return `maps://maps.apple.com/?daddr=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
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

  // Use React Portal to render outside the Map container hierarchy
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 pointer-events-none"
        style={{ 
          zIndex: 9998,
          opacity: isOpen ? 1 : 0 
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        data-testid="location-sheet"
        data-open={isOpen}
        className="rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
        style={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '70vh',
          minHeight: '200px',
          zIndex: 9999,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          backgroundColor: '#171717',
          borderTop: '1px solid #404040',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '8px' }}>
          <div style={{ width: '40px', height: '4px', backgroundColor: '#525252', borderRadius: '9999px' }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          data-testid="location-sheet-close-button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            borderRadius: '9999px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer'
          }}
          aria-label="Close"
        >
          <X style={{ width: '20px', height: '20px', color: '#a3a3a3' }} />
        </button>

        {/* Content */}
        <div style={{ padding: '8px 24px 32px 24px', overflowY: 'auto', maxHeight: 'calc(70vh - 60px)' }}>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid #22c55e',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#f87171', margin: 0 }}>Failed to load location details</p>
            </div>
          )}

          {location && <LocationContent location={location} />}
        </div>
      </div>
    </>,
    document.body
  );
}

// Style constants for the sheet content
const styles = {
  colors: {
    surface50: '#fafafa',
    surface200: '#e5e5e5',
    surface300: '#d4d4d4',
    surface400: '#a3a3a3',
    surface500: '#737373',
    surface600: '#525252',
    surface800: '#262626',
    primary400: '#4ade80',
    primary500: '#22c55e',
    primary600: '#16a34a',
    primary800: '#166534',
    primary900: '#14532d',
    accent300: '#fdba74',
    accent400: '#fb923c',
    accent700: '#c2410c',
    accent900: '#7c2d12',
  }
};

function LocationContent({ location }: { location: LocationDetail }) {
  const primaryType = location.types[0];
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  const handleShare = useCallback(async () => {
    const shareData = {
      title: primaryType?.en_name || 'Foraging Location',
      text: location.description || `Found on Rising Fruit`,
      url: `${window.location.origin}?location=${location.id}`,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        setShareStatus('shared');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('copied');
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
    setTimeout(() => setShareStatus('idle'), 2000);
  }, [location, primaryType]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          flexShrink: 0, 
          width: '48px', 
          height: '48px', 
          backgroundColor: `${styles.colors.primary900}80`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Leaf style={{ width: '24px', height: '24px', color: styles.colors.primary400 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 600, 
            color: styles.colors.surface50,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {primaryType?.en_name || 'Unknown Type'}
          </h2>
          {primaryType?.scientific_name && (
            <p style={{ 
              fontSize: '14px', 
              color: styles.colors.surface500, 
              fontStyle: 'italic',
              margin: '4px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {primaryType.scientific_name}
            </p>
          )}
        </div>
        <button
          onClick={handleShare}
          style={{ 
            flexShrink: 0, 
            padding: '8px', 
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer'
          }}
          aria-label="Share location"
        >
          {shareStatus === 'idle' && <Share2 style={{ width: '20px', height: '20px', color: styles.colors.surface400 }} />}
          {shareStatus === 'copied' && <Copy style={{ width: '20px', height: '20px', color: styles.colors.primary400 }} />}
          {shareStatus === 'shared' && <Check style={{ width: '20px', height: '20px', color: styles.colors.primary400 }} />}
        </button>
      </div>

      {/* Description */}
      {location.description && (
        <p style={{ color: styles.colors.surface300, lineHeight: 1.6, margin: 0 }}>
          {location.description}
        </p>
      )}

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Season */}
        {(() => {
          const seasonInfo = formatSeason(location.season_start, location.season_stop, location.no_season, location.type_ids);
          return (
            <div style={{ backgroundColor: styles.colors.surface800, borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Calendar style={{ width: '16px', height: '16px', color: styles.colors.primary400 }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: styles.colors.surface500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Season</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: styles.colors.surface200, margin: 0 }}>
                {seasonInfo.text}
              </p>
              {seasonInfo.isFallback && (
                <p style={{ fontSize: '11px', color: styles.colors.surface500, margin: '4px 0 0 0', fontStyle: 'italic' }}>
                  (typical for this plant)
                </p>
              )}
            </div>
          );
        })()}

        {/* Access */}
        <div style={{ backgroundColor: styles.colors.surface800, borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Lock style={{ width: '16px', height: '16px', color: location.access?.toLowerCase().includes('private') ? styles.colors.accent400 : styles.colors.surface500 }} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: styles.colors.surface500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access</span>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: styles.colors.surface200, margin: 0 }}>
            {location.access || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Additional types */}
      {location.types.length > 1 && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: 500, color: styles.colors.surface500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Also contains</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {location.types.slice(1).map((type) => (
              <span
                key={type.id}
                style={{
                  padding: '4px 12px',
                  backgroundColor: `${styles.colors.primary900}80`,
                  color: styles.colors.primary400,
                  borderRadius: '9999px',
                  fontSize: '14px',
                  border: `1px solid ${styles.colors.primary800}`
                }}
              >
                {type.en_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Verification status */}
      {location.unverified && (
        <div style={{ 
          backgroundColor: `${styles.colors.accent900}4d`, 
          border: `1px solid ${styles.colors.accent700}`,
          borderRadius: '12px',
          padding: '12px'
        }}>
          <p style={{ fontSize: '14px', color: styles.colors.accent300, margin: 0 }}>
            ⚠️ This location has not been verified
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ paddingTop: '8px' }}>
        <a
          href={getDirectionsUrl(location.lat, location.lng)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '14px',
            backgroundColor: styles.colors.primary600,
            color: 'white',
            fontWeight: 500,
            borderRadius: '12px',
            textDecoration: 'none',
            boxSizing: 'border-box'
          }}
        >
          <Navigation style={{ width: '20px', height: '20px' }} />
          Get Directions
          <ExternalLink style={{ width: '16px', height: '16px', opacity: 0.7 }} />
        </a>
      </div>

      {/* Meta info */}
      {location.author && (
        <p style={{ fontSize: '12px', color: styles.colors.surface600, textAlign: 'center', margin: 0 }}>
          Added by {location.author}
        </p>
      )}
    </div>
  );
}
