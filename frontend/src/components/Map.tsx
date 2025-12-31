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
import { Box, Paper, Text, Group, Loader, Button, Stack } from '@mantine/core';
import { Leaf } from 'lucide-react';
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
import { fruitIcons, fruitIconsInSeason, getIconForTypes, defaultIcon, defaultIconInSeason } from './FruitIcons';
import { isIconInSeason, areTypeIdsInSeason } from '../lib/fruitSeasons';
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

// Generate SVG for cluster with percentage arc indicator
// The arc shows what percentage of items in the cluster are in season
const generateClusterSvg = (percentage: number, size: number): string => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (percentage / 100) * circumference;
  const gapLength = circumference - arcLength;
  
  // Rotate to start from top (-90 degrees)
  const rotation = -90;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background circle -->
    <circle cx="${center}" cy="${center}" r="${radius}" fill="${surface[800]}" stroke="${surface[700]}" stroke-width="2"/>
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
const CLUSTER_SIZES = [40, 60, 80]; // Small, medium, large clusters
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
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<BoundingBox | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
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

      {/* Location detail sheet */}
      <LocationSheet
        locationId={selectedLocationId}
        onClose={() => setSelectedLocationId(null)}
      />
    </Box>
  );
}
