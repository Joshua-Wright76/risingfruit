import { useCallback, useRef, useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { Leaf } from 'lucide-react';
import { getLocations } from '../lib/api';
import type { BoundingBox, Location, PlantType } from '../types/location';
import type { FeatureCollection, Point } from 'geojson';
import { LocationSheet } from './LocationSheet';
import { SearchBar } from './SearchBar';
import { FilterPanel, type FilterState } from './FilterPanel';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { markerIcons } from './MarkerIcons';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

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
    features: locations.map((loc) => ({
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
      },
    })),
  };
}

// Cluster layer style
const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'locations',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#22c55e', // primary-500
      50,
      '#16a34a', // primary-600
      200,
      '#15803d', // primary-700
    ],
    'circle-radius': ['step', ['get', 'point_count'], 20, 50, 30, 200, 40],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#171717',
  },
};

// Cluster count label
const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'locations',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

// Individual point style with custom icons
const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'symbol',
  source: 'locations',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'icon-image': [
      'case',
      ['get', 'unverified'],
      'marker-unverified',
      'marker-leaf',
    ],
    'icon-size': 1,
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
      '#f97316', // accent-500 for unverified
      '#22c55e', // primary-500 for verified
    ],
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#171717',
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
    const iconEntries: [string, string][] = [
      ['marker-leaf', markerIcons.leaf],
      ['marker-flower', markerIcons.flower],
      ['marker-scissors', markerIcons.scissors],
      ['marker-bag', markerIcons.bag],
      ['marker-unverified', markerIcons.unverified],
      ['marker-generic', markerIcons.generic],
    ];

    let loadedCount = 0;
    const totalIcons = iconEntries.length;

    iconEntries.forEach(([name, dataUri]) => {
      if (map.hasImage(name)) {
        loadedCount++;
        if (loadedCount === totalIcons) setIconsLoaded(true);
        return;
      }

      const img = new Image(32, 32);
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
    }
  }, [loadMarkerIcons]);

  // Handle marker click
  const handleClick = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

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
      const locationId = feature.properties?.id;
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

  const geojson = data?.locations ? locationsToGeoJSON(data.locations) : null;
  const hasActiveFilters = selectedTypes.length > 0 || filters.categories.length > 0 || filters.inSeasonOnly;
  const showEmptyState = mapLoaded && !isLoading && !error && data?.count === 0;

  // Choose which point layer to use based on whether icons loaded
  const pointLayer = iconsLoaded ? unclusteredPointLayer : unclusteredPointFallbackLayer;
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
    <div className="relative h-full w-full bg-surface-950">
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
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...pointLayer} />
          </Source>
        )}
      </Map>

      {/* Search and filters */}
      <div className="absolute top-4 left-4 right-4 space-y-3 z-10">
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
