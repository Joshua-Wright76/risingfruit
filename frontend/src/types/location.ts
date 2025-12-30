export interface Location {
  id: number;
  lat: number;
  lng: number;
  description: string | null;
  access: string | null;
  season_start: string | null;
  season_stop: string | null;
  type_ids: number[];
  unverified: boolean;
}

export interface LocationDetail extends Location {
  author: string | null;
  address: string | null;
  no_season: boolean;
  created_at: string;
  updated_at: string;
  types: PlantType[];
}

export interface PlantType {
  id: number;
  en_name: string;
  scientific_name: string | null;
  category_mask: string;
  parent_id: number | null;
  parent_name: string | null;
}

export interface PlantTypeDetail extends PlantType {
  taxonomic_rank: string | null;
  wikipedia_url: string | null;
  localized_names: Record<string, string>;
  children: PlantType[];
  location_count: number;
}

export interface LocationsResponse {
  count: number;
  locations: Location[];
}

export interface TypesResponse {
  count: number;
  types: PlantType[];
}

export interface BoundingBox {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
}

export interface HealthResponse {
  status: string;
  database: string;
}

export interface StatsResponse {
  locations_total: number;
  locations_verified: number;
  types_total: number;
}

