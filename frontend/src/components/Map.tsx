import { useCallback, useRef, useState } from 'react';
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl,
  Source,
  type MapRef,
  type ViewStateChangeEvent,
  type LayerProps,
} from 'react-map-gl/mapbox';
import { useQuery } from '@tanstack/react-query';
import { Leaf } from 'lucide-react';
import { getLocations } from '../lib/api';
import type { BoundingBox, Location } from '../types/location';
import type { FeatureCollection, Point } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Default to San Francisco
const INITIAL_VIEW = {
  latitude: 37.7749,
  longitude: -122.4194,
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
    'circle-stroke-color': '#ffffff',
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

// Individual point style
const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
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
    'circle-stroke-color': '#ffffff',
  },
};

export function ForagingMap() {
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<BoundingBox | null>(null);

  // Query locations when bounds change
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations', bounds],
    queryFn: () => (bounds ? getLocations(bounds, { limit: 1000 }) : null),
    enabled: !!bounds,
    staleTime: 30000, // Cache for 30s
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

  // Initial load
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
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
  }, []);

  const geojson = data?.locations ? locationsToGeoJSON(data.locations) : null;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary-50">
        <div className="text-center p-8">
          <Leaf className="mx-auto h-16 w-16 text-primary-500 mb-4" />
          <h2 className="text-xl font-semibold text-primary-900 mb-2">
            Mapbox Token Required
          </h2>
          <p className="text-primary-700 max-w-md">
            Add your Mapbox access token to{' '}
            <code className="bg-primary-100 px-2 py-1 rounded text-sm">
              .env.local
            </code>{' '}
            as{' '}
            <code className="bg-primary-100 px-2 py-1 rounded text-sm">
              VITE_MAPBOX_TOKEN
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        onLoad={handleLoad}
        onMoveEnd={handleMoveEnd}
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
            <Layer {...unclusteredPointLayer} />
          </Source>
        )}
      </Map>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2 text-primary-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Location count */}
      {data && !isLoading && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-sm font-medium text-primary-800">
            {data.count.toLocaleString()} locations
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-lg">
          <span className="text-sm text-red-700">Failed to load locations</span>
        </div>
      )}
    </div>
  );
}
