import { useCallback, useMemo, useRef, useState } from 'react';
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl,
  Source,
  type MapRef,
  type ViewStateChangeEvent,
  type LayerProps,
  type MapMouseEvent,
} from 'react-map-gl/mapbox';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Leaf } from 'lucide-react';
import { getLocations } from '../lib/api';
import { marker } from '../lib/colors';
import type { BoundingBox, Location, PlantType } from '../types/location';
import type { FeatureCollection, Point } from 'geojson';
import { LocationSheet } from './LocationSheet';
import { SearchBar } from './SearchBar';
import { FilterPanel, type FilterState } from './FilterPanel';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { markerIcons } from './MarkerIcons';
import { fruitIcons, fruitIconsInSeason, getIconForTypes, defaultIcon, defaultIconInSeason } from './FruitIcons';
import { isIconInSeason } from '../lib/fruitSeasons';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Default to Long Beach, CA
const INITIAL_VIEW = {
  latitude: 33.7701,
  longitude: -118.1937,
  zoom: 12,
};

// Check if a location is in season based on its season data
function isLocationInSeason(loc: Location): boolean {
  // If no season info, assume always in season
  if (!loc.season_start && !loc.season_stop) return true;
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const currentMonthIndex = months.indexOf(currentMonth);
  
  const startIndex = loc.season_start ? months.indexOf(loc.season_start) : 0;
  const stopIndex = loc.season_stop ? months.indexOf(loc.season_stop) : 11;
  
  // Handle wrap-around seasons (e.g., Nov-Feb)
  if (startIndex <= stopIndex) {
    return currentMonthIndex >= startIndex && currentMonthIndex <= stopIndex;
  } else {
    return currentMonthIndex >= startIndex || currentMonthIndex <= stopIndex;
  }
}

// Convert locations to GeoJSON for clustering
function locationsToGeoJSON(locations: Location[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: locations.map((loc) => {
      // Determine which icon to use based on type IDs
      const fruitIcon = getIconForTypes(loc.type_ids);
      // Check if the fruit is currently in season (for green border)
      // For fruit icons, use the icon's season; for default, use location's season data
      const fruitInSeason = fruitIcon 
        ? isIconInSeason(fruitIcon) 
        : isLocationInSeason(loc);
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

// Cluster layer style - colors from src/lib/colors.ts
// Uses grey colors for dark mode - edit marker.cluster in colors.ts to customize
const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'locations',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      marker.cluster.low,     // Low density
      50,
      marker.cluster.medium,  // Medium density
      200,
      marker.cluster.high,    // High density
    ],
    'circle-radius': ['step', ['get', 'point_count'], 20, 50, 30, 200, 40],
    'circle-stroke-width': 2,
    'circle-stroke-color': marker.cluster.stroke,
  },
};

// Cluster count label - shows "inSeason/total" (e.g., "12/77")
const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'locations',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': [
      'concat',
      ['get', 'inSeasonSum'],
      '/',
      ['get', 'point_count_abbreviated']
    ],
    'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
  paint: {
    'text-color': marker.cluster.text,
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
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<BoundingBox | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    inSeasonOnly: false,
  });

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

    const allIconEntries = [...baseIconEntries, ...fruitIconEntries, ...fruitInSeasonIconEntries];

    let loadedCount = 0;
    const totalIcons = allIconEntries.length;

    allIconEntries.forEach(([name, dataUri]) => {
      if (map.hasImage(name)) {
        loadedCount++;
        if (loadedCount === totalIcons) setIconsLoaded(true);
        return;
      }

      const img = new Image(40, 40);
      img.onload = () => {
        if (!map.hasImage(name)) {
          map.addImage(name, img, { sdf: false });
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
    setFilters({ categories: [], inSeasonOnly: false });
  }, []);

  // Memoize GeoJSON to prevent unnecessary re-renders during pan/zoom
  const geojson = useMemo(
    () => data?.locations ? locationsToGeoJSON(data.locations) : null,
    [data?.locations]
  );
  const hasActiveFilters = selectedTypes.length > 0 || filters.categories.length > 0 || filters.inSeasonOnly;
  const showEmptyState = mapLoaded && !isLoading && !error && data?.count === 0;

  // Interactive layers for click handling
  const interactiveLayerIds = iconsLoaded 
    ? ['clusters', 'unclustered-point']
    : ['clusters', 'unclustered-point-fallback'];

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-950">
        <div className="text-center p-8">
          <Leaf className="mx-auto h-16 w-16 text-primary-500 mb-4" />
          <h2 className="text-xl font-semibold text-surface-50 mb-2">
            Mapbox Token Required
          </h2>
          <p className="text-surface-400 max-w-md">
            Add your Mapbox access token to{' '}
            <code className="bg-surface-800 px-2 py-1 rounded text-sm text-primary-400">
              .env.local
            </code>{' '}
            as{' '}
            <code className="bg-surface-800 px-2 py-1 rounded text-sm text-primary-400">
              VITE_MAPBOX_TOKEN
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-surface-950" style={{ width: '100%', height: '100%' }}>
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
        <GeolocateControl
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
          showUserHeading
        />
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

      {/* Search and filters */}
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        right: '16px', 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <SearchBar
          selectedTypes={selectedTypes}
          onSelectType={handleSelectType}
          onClearTypes={handleClearTypes}
        />
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Loading indicator */}
      {isLoading && mapLoaded && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-surface-900/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-surface-700 z-10">
          <div className="flex items-center gap-2 text-primary-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Location count */}
      {data && !isLoading && data.count > 0 && (
        <div className="absolute bottom-24 left-4 bg-surface-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-surface-700 z-10">
          <span className="text-sm font-medium text-surface-200">
            {data.count.toLocaleString()} locations
          </span>
        </div>
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
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-950/95 backdrop-blur-sm border border-red-800 px-4 py-3 rounded-xl shadow-lg z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-200">Failed to load locations</span>
            <button
              onClick={() => refetch()}
              className="text-sm font-medium text-red-400 hover:text-red-300 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Location detail sheet */}
      <LocationSheet
        locationId={selectedLocationId}
        onClose={() => setSelectedLocationId(null)}
      />
    </div>
  );
}
