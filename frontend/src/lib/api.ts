import type {
  BoundingBox,
  LocationsResponse,
  LocationDetail,
  TypesResponse,
  PlantTypeDetail,
  HealthResponse,
  StatsResponse,
} from '../types/location';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-16-144-65-155.us-west-2.compute.amazonaws.com:8000';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getHealth(): Promise<HealthResponse> {
  return fetchJson(`${API_BASE_URL}/api/health`);
}

export async function getStats(): Promise<StatsResponse> {
  return fetchJson(`${API_BASE_URL}/api/stats`);
}

export async function getLocations(
  bounds: BoundingBox,
  options?: {
    types?: number[];
    limit?: number;
    offset?: number;
    verified_only?: boolean;
  }
): Promise<LocationsResponse> {
  const params = new URLSearchParams({
    sw_lat: bounds.sw_lat.toString(),
    sw_lng: bounds.sw_lng.toString(),
    ne_lat: bounds.ne_lat.toString(),
    ne_lng: bounds.ne_lng.toString(),
  });

  if (options?.types?.length) {
    params.set('types', options.types.join(','));
  }
  if (options?.limit) {
    params.set('limit', options.limit.toString());
  }
  if (options?.offset) {
    params.set('offset', options.offset.toString());
  }
  if (options?.verified_only) {
    params.set('verified_only', 'true');
  }

  return fetchJson(`${API_BASE_URL}/api/locations?${params}`);
}

export async function getLocation(id: number): Promise<LocationDetail> {
  return fetchJson(`${API_BASE_URL}/api/locations/${id}`);
}

export async function getTypes(options?: {
  category?: string;
  search?: string;
}): Promise<TypesResponse> {
  const params = new URLSearchParams();
  
  if (options?.category) {
    params.set('category', options.category);
  }
  if (options?.search) {
    params.set('search', options.search);
  }

  const queryString = params.toString();
  const url = queryString 
    ? `${API_BASE_URL}/api/types?${queryString}`
    : `${API_BASE_URL}/api/types`;
  
  return fetchJson(url);
}

export async function getType(id: number): Promise<PlantTypeDetail> {
  return fetchJson(`${API_BASE_URL}/api/types/${id}`);
}

