import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  Layer,
  NavigationControl,
  Source,
  type MapRef,
  type ViewStateChangeEvent,
  type LayerProps,
  type MapMouseEvent,
} from 'react-map-gl/mapbox';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Box, Paper, Text, Group, Loader, Button, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { Leaf, Navigation2, MapPin, Crosshair } from 'lucide-react';
import { CompassRose } from './CompassRose';
import { getLocations } from '../lib/api';
import { marker, primary, surface } from '../lib/colors';
import type { BoundingBox, Location, PlantType } from '../types/location';
import type { FeatureCollection, Point } from 'geojson';
import { LocationSheet } from './LocationSheet';
import { SearchBar } from './SearchBar';
import { FilterPanel, type FilterState } from './FilterPanel';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { markerIcons } from './MarkerIcons';
import { fruitIcons, fruitIconsInSeason, getIconForTypes, defaultIcon, defaultIconInSeason, ICON_SIZE, ICON_PIXEL_RATIO } from './FruitIcons';
import { isIconInSeason, areTypeIdsInSeason } from '../lib/fruitSeasons';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
type CompassPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported' | 'not_required';

// Default to Long Beach, CA
const INITIAL_VIEW = {
  latitude: 33.7701,
  longitude: -118.1937,
  zoom: 12,
};

// Convert locations to GeoJSON for clustering
function locationsToGeoJSON(locations: Location[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: locations.map((loc) => {
      // Determine which icon to use based on type IDs
      const fruitIcon = getIconForTypes(loc.type_ids);
      // Check if the fruit is currently in season (for green border)
      // For fruit icons, use the icon's season; for default, use type-based season lookup
      const fruitInSeason = fruitIcon 
        ? isIconInSeason(fruitIcon) 
        : areTypeIdsInSeason(loc.type_ids);
      return {
        type: 'Feature' as const,
        id: loc.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.lng, loc.lat],
        },
        properties: {
          id: loc.id,
          description: loc.description,
          access: loc.access,
          type_ids: loc.type_ids,
          unverified: loc.unverified,
          // Include fruitIcon if exists, always include inSeason status
          ...(fruitIcon ? { fruitIcon } : {}),
          fruitInSeason,
          inSeason: fruitInSeason ? 1 : 0, // Numeric for cluster aggregation
        },
      };
    }),
  };
}

// Cluster icon pixel ratio for high-DPI rendering (same as fruit icons)
const CLUSTER_PIXEL_RATIO = 2;

// Generate SVG for cluster with percentage arc indicator
// The arc shows what percentage of items in the cluster are in season
// logicalSize is the display size, actual SVG is rendered at 2x for retina
const generateClusterSvg = (percentage: number, logicalSize: number): string => {
  const actualSize = logicalSize * CLUSTER_PIXEL_RATIO;
  const strokeWidth = 4 * CLUSTER_PIXEL_RATIO;
  const radius = (actualSize - strokeWidth) / 2;
  const center = actualSize / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (percentage / 100) * circumference;
  const gapLength = circumference - arcLength;

  // Rotate to start from top (-90 degrees)
  const rotation = -90;

  return `<svg width="${actualSize}" height="${actualSize}" viewBox="0 0 ${actualSize} ${actualSize}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background circle -->
    <circle cx="${center}" cy="${center}" r="${radius}" fill="${surface[800]}" stroke="${surface[700]}" stroke-width="${2 * CLUSTER_PIXEL_RATIO}"/>
    <!-- Progress arc (green) -->
    <circle
      cx="${center}"
      cy="${center}"
      r="${radius}"
      fill="none"
      stroke="${primary[500]}"
      stroke-width="${strokeWidth}"
      stroke-dasharray="${arcLength} ${gapLength}"
      stroke-linecap="round"
      transform="rotate(${rotation} ${center} ${center})"
    />
  </svg>`;
};

// Pre-generate cluster icons at 5% increments for different sizes
const CLUSTER_SIZES = [40, 60, 80]; // Small, medium, large clusters (logical sizes)
const PERCENTAGE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

const clusterIcons: Record<string, string> = {};
CLUSTER_SIZES.forEach(size => {
  PERCENTAGE_STEPS.forEach(pct => {
    const key = `cluster-${size}-${pct}`;
    clusterIcons[key] = `data:image/svg+xml,${encodeURIComponent(generateClusterSvg(pct, size))}`;
  });
});

// Cluster layer - uses symbol layer with percentage arc icons
const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'symbol',
  source: 'locations',
  filter: ['has', 'point_count'],
  layout: {
    'icon-image': [
      'concat',
      'cluster-',
      // Size based on point count
      ['step', ['get', 'point_count'], '40', 50, '60', 200, '80'],
      '-',
      // Percentage rounded to nearest 5%
      [
        '*',
        5,
        ['round', ['/', ['*', 100, ['/', ['get', 'inSeasonSum'], ['get', 'point_count']]], 5]]
      ]
    ],
    'icon-size': 1,
    'icon-allow-overlap': true,
  },
};

// Cluster count - combined text, properly centered
// Green arc already shows the percentage visually
const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'locations',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': [
      'concat',
      ['to-string', ['get', 'inSeasonSum']],
      '/',
      ['to-string', ['get', 'point_count']]
    ],
    'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
    'text-size': 12,
    'text-anchor': 'center',
    'text-allow-overlap': true,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

// Individual point style with custom icons
// Uses fruit-specific icons when available, falls back to green heart emoji
// Icons in season get green border variant
const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'symbol',
  source: 'locations',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'icon-image': [
      'case',
      // If unverified, use unverified marker
      ['==', ['get', 'unverified'], true],
      'marker-unverified',
      // If has fruit icon and is in season, use in-season variant
      ['all', ['has', 'fruitIcon'], ['==', ['get', 'fruitInSeason'], true]],
      ['concat', 'fruit-inseason-', ['get', 'fruitIcon']],
      // If has fruit icon but not in season, use regular variant
      ['has', 'fruitIcon'],
      ['concat', 'fruit-', ['get', 'fruitIcon']],
      // Default: green heart emoji (with season-aware border)
      ['==', ['get', 'fruitInSeason'], true],
      'marker-default-inseason',
      'marker-default',
    ],
    'icon-size': 1.25,
    'icon-allow-overlap': true,
    'icon-anchor': 'center',
  },
};

// Fallback circle layer (used if icons fail to load)
const unclusteredPointFallbackLayer: LayerProps = {
  id: 'unclustered-point-fallback',
  type: 'circle',
  source: 'locations',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'case',
      ['get', 'unverified'],
      marker.unverified,
      marker.verified,
    ],
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': marker.stroke,
  },
};

export function ForagingMap() {
  const showCompassDebug = useMemo(() => {
    if (import.meta.env.DEV) return true;
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('debugCompass');
  }, []);
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<BoundingBox | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    inSeasonOnly: false,
  });
  
  // 3D compass mode state
  const [is3DMode, setIs3DMode] = useState(false);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const compassListenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const compassAbsoluteListenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const motionListenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const smoothedHeadingRef = useRef<number | null>(null);
  const SMOOTHING_FACTOR = 0.15; // Lower = smoother, higher = more responsive
  const [motionPermission, setMotionPermission] = useState<CompassPermissionState>('unknown');
  const [orientationPermission, setOrientationPermission] = useState<CompassPermissionState>('unknown');
  const [compassListenerActive, setCompassListenerActive] = useState(false);
  const [lastOrientationEventAt, setLastOrientationEventAt] = useState<number | null>(null);
  const [lastMotionEventAt, setLastMotionEventAt] = useState<number | null>(null);
  const [lastRawHeading, setLastRawHeading] = useState<number | null>(null);
  const [lastAlpha, setLastAlpha] = useState<number | null>(null);
  const [lastAccel, setLastAccel] = useState<{ x: number | null; y: number | null; z: number | null } | null>(null);
  const [mapBearing, setMapBearing] = useState<number | null>(null);
  
  // 3D mode location tracking
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const previousViewRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const userInteractionHandlerRef = useRef<(() => void) | null>(null);

  // Handle compass orientation events with smoothing
  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    // iOS provides webkitCompassHeading directly
    // Android requires calculation from alpha (with beta/gamma for tilt compensation)
    let heading: number | null = null;

    // Type assertion for iOS-specific property
    const event = e as DeviceOrientationEvent & { webkitCompassHeading?: number };

    if (event.webkitCompassHeading !== undefined) {
      // iOS: webkitCompassHeading is degrees from north (0-360)
      heading = event.webkitCompassHeading;
    } else if (e.alpha !== null) {
      // Android: alpha is rotation around z-axis
      // Convert to compass heading (0 = north, 90 = east, etc.)
      heading = (360 - e.alpha) % 360;
    }

    if (heading !== null) {
      setLastOrientationEventAt(Date.now());
      setLastRawHeading(heading);
      setLastAlpha(e.alpha ?? null);
      // Apply exponential moving average smoothing to reduce jitter
      if (smoothedHeadingRef.current === null) {
        smoothedHeadingRef.current = heading;
      } else {
        // Handle wrap-around (359° → 1°)
        let delta = heading - smoothedHeadingRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        smoothedHeadingRef.current = (smoothedHeadingRef.current + delta * SMOOTHING_FACTOR + 360) % 360;
      }
      setCompassHeading(smoothedHeadingRef.current);
    }
  }, [SMOOTHING_FACTOR]);

  const handleDeviceMotion = useCallback((e: DeviceMotionEvent) => {
    setLastMotionEventAt(Date.now());
    setLastAccel({
      x: e.accelerationIncludingGravity?.x ?? null,
      y: e.accelerationIncludingGravity?.y ?? null,
      z: e.accelerationIncludingGravity?.z ?? null,
    });
  }, []);

  // Start listening to compass
  const startCompass = useCallback(async () => {
    // Check if DeviceOrientationEvent is available
    if (!('DeviceOrientationEvent' in window)) {
      console.warn('Device orientation not supported');
      setOrientationPermission('unsupported');
      setMotionPermission('unsupported');
      return false;
    }

    // iOS 13+ requires permission request (motion + orientation).
    const DME = typeof DeviceMotionEvent !== 'undefined'
      ? (DeviceMotionEvent as typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<'granted' | 'denied'>;
        })
      : undefined;
    const DOE = typeof DeviceOrientationEvent !== 'undefined'
      ? (DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<'granted' | 'denied'>;
        })
      : undefined;
    
    if (DME && typeof DME.requestPermission === 'function') {
      try {
        const permission = await DME.requestPermission();
        setMotionPermission(permission);
        if (permission !== 'granted') {
          console.warn('Device motion permission denied');
          return false;
        }
      } catch (err) {
        console.warn('Error requesting device motion permission:', err);
        setMotionPermission('denied');
        return false;
      }
    } else {
      setMotionPermission('not_required');
    }

    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const permission = await DOE.requestPermission();
        setOrientationPermission(permission);
        if (permission !== 'granted') {
          console.warn('Device orientation permission denied');
          return false;
        }
      } catch (err) {
        console.warn('Error requesting device orientation permission:', err);
        setOrientationPermission('denied');
        return false;
      }
    } else {
      setOrientationPermission('not_required');
    }

    // Store the listener reference for cleanup
    compassListenerRef.current = handleDeviceOrientation;
    compassAbsoluteListenerRef.current = handleDeviceOrientation;
    motionListenerRef.current = handleDeviceMotion;
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    window.addEventListener('deviceorientationabsolute', handleDeviceOrientation);
    window.addEventListener('devicemotion', handleDeviceMotion);
    setCompassListenerActive(true);
    return true;
  }, [handleDeviceOrientation, handleDeviceMotion]);

  // Stop listening to compass
  const stopCompass = useCallback(() => {
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current);
      compassListenerRef.current = null;
    }
    if (compassAbsoluteListenerRef.current) {
      window.removeEventListener('deviceorientationabsolute', compassAbsoluteListenerRef.current);
      compassAbsoluteListenerRef.current = null;
    }
    if (motionListenerRef.current) {
      window.removeEventListener('devicemotion', motionListenerRef.current);
      motionListenerRef.current = null;
    }
    smoothedHeadingRef.current = null;
    setCompassHeading(null);
    setCompassListenerActive(false);
  }, []);

  // Start watching user position
  const startWatchingPosition = useCallback(() => {
    if (!navigator.geolocation) return;
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('Position watch error:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  }, []);

  // Stop watching user position
  const stopWatchingPosition = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Check if location permission is denied (for showing appropriate UI)
  const checkLocationPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> => {
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        return status.state;
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }, []);

  // Center map on user's current location (one-time, no tracking)
  const handleCenterOnLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.getMap()?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          duration: 1000,
        });
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setShowLocationPrompt(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Remove user interaction listeners
  const removeUserInteractionListeners = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map && userInteractionHandlerRef.current) {
      map.off('dragstart', userInteractionHandlerRef.current);
      map.off('rotatestart', userInteractionHandlerRef.current);
      userInteractionHandlerRef.current = null;
    }
  }, []);

  // Exit compass mode when user interacts with the map (keeps current view)
  const exitCompassMode = useCallback(() => {
    stopCompass();
    stopWatchingPosition();
    setUserLocation(null);
    removeUserInteractionListeners();
    setIs3DMode(false);
    // Don't reset pitch/bearing - keep current view
  }, [stopCompass, stopWatchingPosition, removeUserInteractionListeners]);

  // Setup user interaction listeners (exits compass mode on pan/drag)
  const setupUserInteractionListeners = useCallback((map: mapboxgl.Map) => {
    // Clean up any existing listeners first
    removeUserInteractionListeners();

    // Create the handler
    const handler = (event?: { originalEvent?: Event }) => {
      // Ignore programmatic movements (no originalEvent) so 3D mode isn't cancelled.
      if (!event?.originalEvent) return;
      exitCompassMode();
    };
    userInteractionHandlerRef.current = handler;

    // Add listeners
    map.on('dragstart', handler);
    map.on('rotatestart', handler);
  }, [exitCompassMode, removeUserInteractionListeners]);

  // Retry location permission (triggers iOS permission dialog)
  // IMPORTANT: No setTimeout - iOS requires user gesture chain to be intact
  const retryLocationPermission = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Request motion/orientation permission while user gesture is active (iOS requirement).
    void startCompass();

    // Check permission state first
    const permissionState = await checkLocationPermission();

    if (permissionState === 'denied') {
      // Permission was denied - can't trigger dialog, show settings guidance
      setLocationPermissionDenied(true);
      return;
    }

    // Close prompt and immediately request location (preserves user gesture)
    setShowLocationPrompt(false);
    setLocationPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Get fresh map reference inside callback to avoid stale closure
        const currentMap = mapRef.current?.getMap();
        if (!currentMap) return;

        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Save current view
        const center = currentMap.getCenter();
        previousViewRef.current = {
          center: [center.lng, center.lat],
          zoom: currentMap.getZoom(),
        };

        // IMPORTANT: Defer React state updates until AFTER animation completes
        // to prevent re-renders from canceling the mapbox animation

        // Setup user interaction listeners (will exit compass mode on drag/pan)
        setupUserInteractionListeners(currentMap);

        // Update state after animation completes
        currentMap.once('moveend', () => {
          setUserLocation({ lat: userLat, lng: userLng });
          setIs3DMode(true);
          startWatchingPosition();
        });

        // Start the animation
        currentMap.flyTo({
          center: [userLng, userLat],
          zoom: 17,
          pitch: 60,
          duration: 1000,
          essential: true,
        });
      },
      async () => {
        // Check why it failed
        const state = await checkLocationPermission();
        if (state === 'denied') {
          setLocationPermissionDenied(true);
        }
        setShowLocationPrompt(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [startCompass, startWatchingPosition, checkLocationPermission, setupUserInteractionListeners]);

  // Toggle 3D mode
  const toggle3DMode = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (!is3DMode) {
      // Request motion/orientation permission while user gesture is active (iOS requirement).
      void startCompass();

      // Check if geolocation is available
      if (!navigator.geolocation) {
        setShowLocationPrompt(true);
        return;
      }

      // Save current view to restore later (when manually toggling off)
      const center = map.getCenter();
      previousViewRef.current = {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
      };

      // Get current position first
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // Get fresh map reference inside callback to avoid stale closure
          const currentMap = mapRef.current?.getMap();
          if (!currentMap) return;

          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;

          // IMPORTANT: Defer React state updates until AFTER animation completes
          // to prevent re-renders from canceling the mapbox animation

          // Setup user interaction listeners (will exit compass mode on drag/pan)
          setupUserInteractionListeners(currentMap);

          // Update state after animation completes
          currentMap.once('moveend', () => {
            setUserLocation({ lat: userLat, lng: userLng });
            setIs3DMode(true);
            startWatchingPosition();
          });

          // Start the animation
          currentMap.flyTo({
            center: [userLng, userLat],
            zoom: 17,
            pitch: 60,
            duration: 1000,
            essential: true,
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setShowLocationPrompt(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      // Disable 3D mode (manual toggle - restore previous view)
      stopCompass();
      stopWatchingPosition();
      setUserLocation(null);
      removeUserInteractionListeners();

      // Reset to flat view, restore previous position if available
      if (previousViewRef.current) {
        map.flyTo({
          center: previousViewRef.current.center,
          zoom: previousViewRef.current.zoom,
          pitch: 0,
          bearing: 0,
          duration: 500,
        });
        previousViewRef.current = null;
      } else {
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 500,
        });
      }

      setIs3DMode(false);
    }
  }, [is3DMode, startCompass, stopCompass, startWatchingPosition, stopWatchingPosition, setupUserInteractionListeners, removeUserInteractionListeners]);

  const runSensorTest = useCallback(() => {
    void startCompass();
  }, [startCompass]);

  const supportsMotionPermissionRequest = typeof DeviceMotionEvent !== 'undefined'
    && typeof (DeviceMotionEvent as unknown as { requestPermission?: () => void })?.requestPermission === 'function';
  const supportsOrientationPermissionRequest = typeof DeviceOrientationEvent !== 'undefined'
    && typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => void })?.requestPermission === 'function';

  // Update map bearing when compass heading changes
  useEffect(() => {
    if (!is3DMode || compassHeading === null) return;
    
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Smoothly update bearing to match compass heading
    // Note: Mapbox bearing is degrees clockwise from north
    map.setBearing(compassHeading);
    setMapBearing(map.getBearing());
  }, [is3DMode, compassHeading]);

  // Keep map centered on user location in 3D mode
  useEffect(() => {
    if (!is3DMode || !userLocation) return;
    
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Smoothly center on user position
    map.easeTo({
      center: [userLocation.lng, userLocation.lat],
      duration: 300,
    });
  }, [is3DMode, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    // Capture ref values for cleanup
    const mapInstance = mapRef.current?.getMap();

    return () => {
      // Clean up compass listener
      if (compassListenerRef.current) {
        window.removeEventListener('deviceorientation', compassListenerRef.current);
      }
      // Clean up position watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      // Clean up user interaction listeners
      if (mapInstance && userInteractionHandlerRef.current) {
        mapInstance.off('dragstart', userInteractionHandlerRef.current);
        mapInstance.off('rotatestart', userInteractionHandlerRef.current);
      }
    };
  }, []);

  // Query locations when bounds or filters change
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['locations', bounds, selectedTypes, filters],
    queryFn: () => {
      if (!bounds) return null;
      return getLocations(bounds, {
        limit: 1000,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
      });
    },
    enabled: !!bounds,
    staleTime: 30000, // Cache for 30s
    placeholderData: keepPreviousData, // Keep showing previous data while loading to prevent flickering
    retry: 2,
    select: (data) => {
      if (!data || !filters.inSeasonOnly) return data;
      
      // Client-side season filtering
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const currentMonthIndex = months.indexOf(currentMonth);

      const filteredLocations = data.locations.filter((loc) => {
        // If no season info, include it
        if (!loc.season_start && !loc.season_stop) return true;
        
        const startIndex = loc.season_start ? months.indexOf(loc.season_start) : 0;
        const stopIndex = loc.season_stop ? months.indexOf(loc.season_stop) : 11;
        
        // Handle wrap-around seasons (e.g., Nov-Feb)
        if (startIndex <= stopIndex) {
          return currentMonthIndex >= startIndex && currentMonthIndex <= stopIndex;
        } else {
          return currentMonthIndex >= startIndex || currentMonthIndex <= stopIndex;
        }
      });

      return {
        count: filteredLocations.length,
        locations: filteredLocations,
      };
    },
  });

  // Update bounds on map move
  const handleMoveEnd = useCallback((evt: ViewStateChangeEvent) => {
    const map = evt.target;
    const mapBounds = map.getBounds();
    if (mapBounds) {
      setBounds({
        sw_lat: mapBounds.getSouth(),
        sw_lng: mapBounds.getWest(),
        ne_lat: mapBounds.getNorth(),
        ne_lng: mapBounds.getEast(),
      });
    }
  }, []);

  // Load custom marker icons
  const loadMarkerIcons = useCallback((map: mapboxgl.Map) => {
    // Base marker icons
    const baseIconEntries: [string, string][] = [
      ['marker-leaf', markerIcons.leaf],
      ['marker-flower', markerIcons.flower],
      ['marker-scissors', markerIcons.scissors],
      ['marker-bag', markerIcons.bag],
      ['marker-unverified', markerIcons.unverified],
      ['marker-generic', markerIcons.generic],
      // Default icons (green heart emoji) for fruits without specific icons
      ['marker-default', defaultIcon],
      ['marker-default-inseason', defaultIconInSeason],
    ];

    // Fruit-specific icons (regular - gray border)
    const fruitIconEntries: [string, string][] = Object.entries(fruitIcons).map(
      ([name, dataUri]) => [`fruit-${name}`, dataUri]
    );

    // Fruit-specific icons (in-season - green border)
    const fruitInSeasonIconEntries: [string, string][] = Object.entries(fruitIconsInSeason).map(
      ([name, dataUri]) => [`fruit-inseason-${name}`, dataUri]
    );

    // Cluster percentage arc icons
    const clusterIconEntries: [string, string][] = Object.entries(clusterIcons).map(
      ([name, dataUri]) => [name, dataUri]
    );

    const allIconEntries = [...baseIconEntries, ...fruitIconEntries, ...fruitInSeasonIconEntries, ...clusterIconEntries];

    let loadedCount = 0;
    const totalIcons = allIconEntries.length;

    allIconEntries.forEach(([name, dataUri]) => {
      if (map.hasImage(name)) {
        loadedCount++;
        if (loadedCount === totalIcons) setIconsLoaded(true);
        return;
      }

      // Determine image size and pixel ratio based on icon type
      // Cluster icons have format "cluster-{logicalSize}-{percentage}" and variable sizes
      // All other icons use standard ICON_SIZE
      let imageSize: number;
      let pixelRatio: number;

      if (name.startsWith('cluster-')) {
        // Extract logical size from cluster icon name (e.g., "cluster-40-50" -> 40)
        const logicalSize = parseInt(name.split('-')[1], 10);
        imageSize = logicalSize * CLUSTER_PIXEL_RATIO;
        pixelRatio = CLUSTER_PIXEL_RATIO;
      } else {
        imageSize = ICON_SIZE;
        pixelRatio = ICON_PIXEL_RATIO;
      }

      const img = new Image(imageSize, imageSize);
      img.onload = () => {
        if (!map.hasImage(name)) {
          // Specify pixelRatio so Mapbox displays at correct logical size
          map.addImage(name, img, { sdf: false, pixelRatio });
        }
        loadedCount++;
        if (loadedCount === totalIcons) setIconsLoaded(true);
      };
      img.onerror = () => {
        console.warn(`Failed to load marker icon: ${name}`);
        loadedCount++;
        if (loadedCount === totalIcons) setIconsLoaded(true);
      };
      img.src = dataUri;
    });
  }, []);

  // Initial load
  const handleLoad = useCallback(() => {
    setMapLoaded(true);
    const map = mapRef.current?.getMap();
    if (map) {
      // Load custom marker icons
      loadMarkerIcons(map);

      const mapBounds = map.getBounds();
      if (mapBounds) {
        setBounds({
          sw_lat: mapBounds.getSouth(),
          sw_lng: mapBounds.getWest(),
          ne_lat: mapBounds.getNorth(),
          ne_lng: mapBounds.getEast(),
        });
      }
      
      // Expose map for E2E testing (always expose in development)
      // @ts-expect-error - exposing for E2E tests
      window.__risingfruit_map = map;
    }
  }, [loadMarkerIcons]);

  // Handle marker click - query features in a bounding box for better touch targets
  const handleClick = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Query features in a 20px bounding box around the click point
    const clickTolerance = 20;
    const bbox: [[number, number], [number, number]] = [
      [e.point.x - clickTolerance, e.point.y - clickTolerance],
      [e.point.x + clickTolerance, e.point.y + clickTolerance]
    ];
    const allFeatures = map.queryRenderedFeatures(bbox);
    
    // Find features from our layers (clusters, unclustered-point, etc.)
    const ourLayers = ['clusters', 'unclustered-point', 'unclustered-point-fallback'];
    const features = allFeatures.filter(f => ourLayers.includes(f.layer?.id || ''));
    
    const feature = features[0];
    if (!feature) return;

    // If it's a cluster, zoom into it
    if (feature.properties?.cluster) {
      const source = map.getSource('locations');
      if (source && 'getClusterExpansionZoom' in source) {
        const clusterId = feature.properties.cluster_id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (source as any).getClusterExpansionZoom(clusterId, (err: Error | null, zoom: number | null) => {
          if (err || zoom === null) return;
          const geometry = feature.geometry as GeoJSON.Point;
          map.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: zoom + 1,
          });
        });
      }
    } else {
      // It's an individual point, show the detail sheet
      const locationId = feature.properties?.id ? Number(feature.properties.id) : null;
      if (locationId) {
        setSelectedLocationId(locationId);
      }
    }
  }, []);

  // Handle type selection from search
  const handleSelectType = useCallback((type: PlantType) => {
    setSelectedTypes((prev) => 
      prev.includes(type.id) ? prev : [...prev, type.id]
    );
  }, []);

  const handleClearTypes = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedTypes([]);
    setFilters({ inSeasonOnly: false });
  }, []);

  // Memoize GeoJSON to prevent unnecessary re-renders during pan/zoom
  const geojson = useMemo(
    () => data?.locations ? locationsToGeoJSON(data.locations) : null,
    [data?.locations]
  );
  const hasActiveFilters = selectedTypes.length > 0 || filters.inSeasonOnly;
  const showEmptyState = mapLoaded && !isLoading && !error && data?.count === 0;

  // Interactive layers for click handling
  const interactiveLayerIds = iconsLoaded 
    ? ['clusters', 'unclustered-point']
    : ['clusters', 'unclustered-point-fallback'];

  if (!MAPBOX_TOKEN) {
    return (
      <Box
        w="100%"
        h="100%"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--mantine-color-surface-9)',
        }}
      >
        <Stack align="center" p={32} gap={16}>
          <Leaf size={64} style={{ color: 'var(--mantine-color-primary-5)' }} />
          <Text size="xl" fw={600} c="gray.0">
            Mapbox Token Required
          </Text>
          <Text c="gray.4" maw={400} ta="center">
            Add your Mapbox access token to{' '}
            <Text component="code" px={8} py={4} style={{ backgroundColor: 'var(--mantine-color-surface-8)', borderRadius: 4 }} size="sm" c="primary.4">
              .env.local
            </Text>{' '}
            as{' '}
            <Text component="code" px={8} py={4} style={{ backgroundColor: 'var(--mantine-color-surface-8)', borderRadius: 4 }} size="sm" c="primary.4">
              VITE_MAPBOX_TOKEN
            </Text>
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box pos="relative" w="100%" h="100%" style={{ backgroundColor: 'var(--mantine-color-surface-9)' }}>
      {/* Loading skeleton while map initializes */}
      {!mapLoaded && <LoadingSkeleton />}

      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={handleLoad}
        onMoveEnd={handleMoveEnd}
        onClick={handleClick}
        interactiveLayerIds={interactiveLayerIds}
        reuseMaps
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {geojson && (
          <Source
            id="locations"
            type="geojson"
            data={geojson}
            cluster
            clusterMaxZoom={14}
            clusterRadius={50}
            clusterProperties={{
              // Sum up in-season markers for cluster display
              inSeasonSum: ['+', ['get', 'inSeason']]
            }}
            generateId
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            {/* Always render both layers but control visibility via filter */}
            {iconsLoaded && <Layer {...unclusteredPointLayer} />}
            {!iconsLoaded && <Layer {...unclusteredPointFallbackLayer} />}
          </Source>
        )}
      </Map>

      {showCompassDebug && (
        <Paper
          pos="absolute"
          top={12}
          right={12}
          px={12}
          py={10}
          radius="md"
          style={{
            zIndex: 1001,
            backgroundColor: 'rgba(17, 17, 17, 0.85)',
            border: '1px solid var(--mantine-color-surface-7)',
            maxWidth: 260,
          }}
        >
          <Stack gap={4}>
            <Text size="xs" fw={600} c="gray.2">Compass debug</Text>
            <Text size="xs" c="gray.4">3D mode: {String(is3DMode)}</Text>
            <Text size="xs" c="gray.4">Listener: {String(compassListenerActive)}</Text>
            <Text size="xs" c="gray.4">Motion perm: {motionPermission}</Text>
            <Text size="xs" c="gray.4">Orientation perm: {orientationPermission}</Text>
            <Text size="xs" c="gray.4">Heading: {compassHeading === null ? 'null' : compassHeading.toFixed(1)}</Text>
            <Text size="xs" c="gray.4">Raw heading: {lastRawHeading === null ? 'null' : lastRawHeading.toFixed(1)}</Text>
            <Text size="xs" c="gray.4">Alpha: {lastAlpha === null ? 'null' : lastAlpha.toFixed(1)}</Text>
            <Text size="xs" c="gray.4">Map bearing: {mapBearing === null ? 'null' : mapBearing.toFixed(1)}</Text>
            <Text size="xs" c="gray.4">
              Last event: {lastOrientationEventAt === null ? 'never' : `${((Date.now() - lastOrientationEventAt) / 1000).toFixed(1)}s ago`}
            </Text>
            <Text size="xs" c="gray.4">
              Motion event: {lastMotionEventAt === null ? 'never' : `${((Date.now() - lastMotionEventAt) / 1000).toFixed(1)}s ago`}
            </Text>
            <Text size="xs" c="gray.4">
              Accel: {lastAccel ? `${lastAccel.x ?? 'null'}, ${lastAccel.y ?? 'null'}, ${lastAccel.z ?? 'null'}` : 'null'}
            </Text>
            <Text size="xs" c="gray.4">
              Request fn: {String(supportsMotionPermissionRequest)}/{String(supportsOrientationPermissionRequest)}
            </Text>
            <Button size="xs" variant="light" onClick={runSensorTest}>
              Sensor test
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Compass Rose Overlay (visible in 3D mode) */}
      {is3DMode && compassHeading !== null && (
        <CompassRose />
      )}

      {/* Geolocation Button (center only, no tracking) */}
      <Tooltip label="Center on my location" position="left" withArrow>
        <ActionIcon
          pos="absolute"
          bottom={220}
          right={10}
          size={29}
          variant="filled"
          onClick={handleCenterOnLocation}
          aria-label="Center on my location"
          data-testid="geolocate-button"
          style={{
            zIndex: 1,
            backgroundColor: '#fff',
            color: '#333',
            borderRadius: 4,
            boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
          }}
        >
          <Crosshair size={18} />
        </ActionIcon>
      </Tooltip>

      {/* 3D Compass Mode Toggle Button */}
      <Tooltip
        label={is3DMode ? 'Exit 3D mode' : '3D compass mode'}
        position="left"
        withArrow
      >
        <ActionIcon
          pos="absolute"
          bottom={180}
          right={10}
          size={29}
          variant="filled"
          onClick={toggle3DMode}
          aria-label={is3DMode ? 'Exit 3D mode' : 'Enter 3D compass mode'}
          style={{
            zIndex: 1,
            backgroundColor: is3DMode ? 'var(--mantine-color-primary-6)' : '#fff',
            color: is3DMode ? '#fff' : '#333',
            borderRadius: 4,
            boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s, color 0.2s',
          }}
        >
          <Navigation2
            size={18}
            style={{
              transform: is3DMode && compassHeading !== null
                ? `rotate(${compassHeading}deg)`
                : 'rotate(0deg)',
              transition: 'transform 0.1s ease-out',
            }}
          />
        </ActionIcon>
      </Tooltip>

      {/* Search and filters */}
      <Box
        pos="absolute"
        top={16}
        left={16}
        right={16}
        style={{ zIndex: 1000 }}
      >
        <Stack gap={12}>
          <SearchBar
            selectedTypes={selectedTypes}
            onSelectType={handleSelectType}
            onClearTypes={handleClearTypes}
          />
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
          />
        </Stack>
      </Box>

      {/* Loading indicator */}
      {isLoading && mapLoaded && (
        <Paper
          pos="absolute"
          bottom={96}
          left="50%"
          style={{
            transform: 'translateX(-50%)',
            zIndex: 10,
            backgroundColor: 'rgba(23, 23, 23, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--mantine-color-surface-7)',
            pointerEvents: 'none',
          }}
          px={16}
          py={8}
          radius="xl"
          shadow="lg"
        >
          <Group gap={8}>
            <Loader size={16} color="primary.5" />
            <Text size="sm" fw={500} c="primary.4">Loading...</Text>
          </Group>
        </Paper>
      )}

      {/* Location count */}
      {data && !isLoading && data.count > 0 && (
        <Paper
          pos="absolute"
          bottom={96}
          left={16}
          px={12}
          py={6}
          radius="xl"
          shadow="lg"
          style={{
            zIndex: 10,
            backgroundColor: 'rgba(23, 23, 23, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--mantine-color-surface-7)',
            pointerEvents: 'none',
          }}
        >
          <Text size="sm" fw={500} c="gray.2">
            {data.count.toLocaleString()} locations
          </Text>
        </Paper>
      )}

      {/* Empty state */}
      {showEmptyState && (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Error state */}
      {error && (
        <Paper
          pos="absolute"
          bottom={96}
          left="50%"
          px={16}
          py={12}
          radius="lg"
          shadow="lg"
          style={{
            transform: 'translateX(-50%)',
            zIndex: 10,
            backgroundColor: 'rgba(69, 10, 10, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--mantine-color-red-8)',
            pointerEvents: 'auto',
          }}
        >
          <Group gap={12}>
            <Text size="sm" c="red.2">Failed to load locations</Text>
            <Button
              variant="transparent"
              size="compact-sm"
              c="red.4"
              onClick={() => refetch()}
              styles={{
                root: {
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                  '&:hover': {
                    color: 'var(--mantine-color-red-3)',
                  },
                },
              }}
            >
              Retry
            </Button>
          </Group>
        </Paper>
      )}

      {/* Location permission prompt */}
      {showLocationPrompt && (
        <Paper
          pos="absolute"
          top="50%"
          left="50%"
          p={24}
          radius="lg"
          shadow="xl"
          style={{
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
            backgroundColor: 'rgba(23, 23, 23, 0.98)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--mantine-color-surface-6)',
            maxWidth: 320,
          }}
        >
          <Stack align="center" gap={16}>
            <Box
              p={12}
              style={{
                backgroundColor: locationPermissionDenied 
                  ? 'var(--mantine-color-red-9)' 
                  : 'var(--mantine-color-primary-9)',
                borderRadius: '50%',
              }}
            >
              <MapPin 
                size={32} 
                style={{ 
                  color: locationPermissionDenied 
                    ? 'var(--mantine-color-red-4)' 
                    : 'var(--mantine-color-primary-4)' 
                }} 
              />
            </Box>
            <Text size="lg" fw={600} c="gray.0" ta="center">
              {locationPermissionDenied ? 'Location Blocked' : 'Location Required'}
            </Text>
            <Text size="sm" c="gray.4" ta="center">
              {locationPermissionDenied 
                ? 'Location access was denied. You need to enable it in your device settings.'
                : '3D navigation mode needs access to your location to center the map on you and track your movement.'
              }
            </Text>
            {locationPermissionDenied ? (
              <>
                <Box
                  p={12}
                  style={{
                    backgroundColor: 'var(--mantine-color-surface-8)',
                    borderRadius: 8,
                    width: '100%',
                  }}
                >
                  <Text size="xs" c="gray.3" ta="left" fw={500} mb={8}>
                    To enable location:
                  </Text>
                  <Text size="xs" c="gray.4" ta="left" component="div">
                    <div style={{ marginBottom: 4 }}>1. Open <strong>Settings</strong> on your device</div>
                    <div style={{ marginBottom: 4 }}>2. Go to <strong>Safari → Location</strong></div>
                    <div>3. Select <strong>"Ask"</strong> or <strong>"Allow"</strong></div>
                  </Text>
                </Box>
                <Group justify="center" gap={12} w="100%">
                  <Button
                    fullWidth
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setShowLocationPrompt(false);
                      setLocationPermissionDenied(false);
                    }}
                  >
                    Got It
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <Text size="xs" c="gray.5" ta="center">
                  Tap "Enable Location" to grant access.
                </Text>
                <Group justify="center" gap={12} w="100%">
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => setShowLocationPrompt(false)}
                    style={{ flex: 1 }}
                  >
                    Not Now
                  </Button>
                  <Button
                    variant="filled"
                    color="primary"
                    onClick={retryLocationPermission}
                    style={{ flex: 1 }}
                  >
                    Enable Location
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Paper>
      )}

      {/* Location detail sheet */}
      <LocationSheet
        locationId={selectedLocationId}
        onClose={() => setSelectedLocationId(null)}
      />
    </Box>
  );
}
