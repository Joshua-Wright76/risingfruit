# Rising Fruit - Agent Context

> A mobile-first PWA client for the Falling Fruit urban foraging map.

## Project Overview

Rising Fruit is a Progressive Web App that provides a modern, mobile-first interface for discovering and sharing urban foraging locations. It consumes data from the [Falling Fruit](https://fallingfruit.org/) open-source foraging database.

**Current Status:** Backend complete, ready for frontend development.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Rising Fruit PWA (TODO)                      │
│            React + Vite + Tailwind + Mapbox GL                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Rising Fruit Backend (EC2)                    │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐     │
│  │ Data Sync   │───▶│   SQLite     │◀───│   FastAPI       │     │
│  │ (CSV)       │    │   + R-tree   │    │   REST API      │     │
│  └─────────────┘    └──────────────┘    └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Nightly sync
┌─────────────────────────────┴───────────────────────────────────┐
│                    Falling Fruit Exports                         │
│  https://fallingfruit.org/locations.csv.bz2 (508 MB)            │
│  https://fallingfruit.org/types.csv.bz2 (683 KB)                │
└─────────────────────────────────────────────────────────────────┘
```

## Backend API

### Base URL

```
http://ec2-16-144-65-155.us-west-2.compute.amazonaws.com:8000
```

### Endpoints

#### Health & Stats

```http
GET /api/health
```
```json
{"status": "healthy", "database": "connected"}
```

```http
GET /api/stats
```
```json
{
  "locations_total": 1945804,
  "locations_verified": 1856414,
  "types_total": 4013
}
```

#### Locations

**Query locations by bounding box** (primary endpoint for map):

```http
GET /api/locations?sw_lat={lat}&sw_lng={lng}&ne_lat={lat}&ne_lng={lng}&limit={n}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sw_lat` | float | Yes | Southwest latitude |
| `sw_lng` | float | Yes | Southwest longitude |
| `ne_lat` | float | Yes | Northeast latitude |
| `ne_lng` | float | Yes | Northeast longitude |
| `types` | string | No | Comma-separated type IDs to filter |
| `limit` | int | No | Max results (default 1000, max 5000) |
| `offset` | int | No | Pagination offset |
| `verified_only` | bool | No | Only verified locations |

**Example:**
```bash
curl "http://ec2-16-144-65-155.us-west-2.compute.amazonaws.com:8000/api/locations?sw_lat=37.7&sw_lng=-122.5&ne_lat=37.8&ne_lng=-122.4&limit=100"
```

**Response:**
```json
{
  "count": 100,
  "locations": [
    {
      "id": 12345,
      "lat": 37.7749,
      "lng": -122.4194,
      "description": "Large apple tree in park",
      "access": "Public",
      "season_start": "September",
      "season_stop": "November",
      "type_ids": [114],
      "unverified": false
    }
  ]
}
```

**Get single location:**

```http
GET /api/locations/{id}
```

**Response:**
```json
{
  "id": 22,
  "lat": 37.4098,
  "lng": -122.1375,
  "description": "Nice big tart oranges",
  "access": "Private but overhanging",
  "season_start": "December",
  "season_stop": null,
  "type_ids": [3],
  "unverified": false,
  "author": "Caleb",
  "address": null,
  "no_season": false,
  "created_at": "2013-01-31 21:26:20 UTC",
  "updated_at": "2016-12-03 23:57:20 UTC",
  "types": [
    {
      "id": 3,
      "en_name": "Orange",
      "scientific_name": "Citrus x sinensis",
      "category_mask": "forager, grafter"
    }
  ]
}
```

#### Types

**List all types:**

```http
GET /api/types?category={cat}&search={term}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter: `forager`, `honeybee`, `grafter`, `freegan` |
| `search` | string | Search by name (min 2 chars) |

**Response:**
```json
{
  "count": 302,
  "types": [
    {
      "id": 114,
      "en_name": "Apple",
      "scientific_name": "Malus domestica",
      "category_mask": "forager, honeybee, grafter",
      "parent_id": 285,
      "parent_name": "Malus"
    }
  ]
}
```

**Get single type:**

```http
GET /api/types/{id}
```

**Response:**
```json
{
  "id": 3,
  "en_name": "Orange",
  "scientific_name": "Citrus x sinensis",
  "taxonomic_rank": "Species",
  "category_mask": "forager, grafter",
  "wikipedia_url": "http://en.wikipedia.org/wiki/Citrus_sinensis",
  "parent_id": 5071,
  "parent_name": "Citrus",
  "localized_names": {
    "ar": "برتقال",
    "de": "Orange",
    "es": "Naranjo dulce",
    "fr": "Oranger",
    "zh_hans": "柠檬"
  },
  "children": [],
  "location_count": 1907
}
```

### Swagger Documentation

Interactive API docs available at:
```
http://ec2-16-144-65-155.us-west-2.compute.amazonaws.com:8000/docs
```

## Database Schema

### Tables

**locations** (~2M rows)
- `id` - Primary key
- `lat`, `lng` - Coordinates (WGS84)
- `description` - User notes
- `access` - "Public", "Private", "Private but overhanging", etc.
- `season_start`, `season_stop` - Harvest months
- `author` - Contributor name
- `unverified` - Boolean
- `hidden` - Boolean

**types** (~4K rows)
- `id` - Primary key
- `en_name` - English name
- `scientific_name` - Latin name
- `category_mask` - "forager", "honeybee", "grafter", "freegan"
- `localized_names` - JSON with translations
- `parent_id` - Hierarchy reference

**location_types** (junction table)
- `location_id` → locations
- `type_id` → types

**locations_rtree** (R-tree spatial index)
- Enables O(log n) bounding box queries

## Tech Stack

### Backend (Complete)

| Component | Technology |
|-----------|------------|
| API Framework | FastAPI |
| Database | SQLite with R-tree |
| Containerization | Docker |
| Hosting | AWS EC2 (t2.micro) |
| CI/CD | GitHub Actions |

### Frontend (To Build)

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Maps | Mapbox GL JS |
| State Management | TanStack Query |
| Routing | React Router v6 |
| PWA | vite-plugin-pwa |

## Project Structure

```
risingfruit/
├── .cursor/rules/risingfruit.mdc   # Agent rules
├── .github/workflows/deploy.yml    # CI/CD pipeline
├── backend/
│   ├── db/
│   │   ├── schema.sql              # SQLite schema
│   │   └── import.py               # CSV import script
│   ├── src/
│   │   ├── main.py                 # FastAPI app
│   │   └── database.py             # DB utilities
│   ├── scripts/
│   │   └── sync-data.sh            # Data download script
│   ├── data/                       # CSV + SQLite (gitignored)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/
│   ├── api-reference.md
│   └── architecture.md
├── src/                            # Frontend (TODO)
├── .env.local                      # Secrets (gitignored)
├── .gitignore
└── AGENT_CONTEXT.md                # This file
```

## Environment Variables

```bash
# .env.local

# Backend API
VITE_API_BASE_URL=http://ec2-16-144-65-155.us-west-2.compute.amazonaws.com:8000

# Mapbox (get from mapbox.com)
VITE_MAPBOX_TOKEN=pk.your_token_here

# EC2 (for deployment)
VITE_EC2_HOST=ec2-16-144-65-155.us-west-2.compute.amazonaws.com
```

## Frontend Requirements

### Core Features

1. **Map View** (Primary)
   - Full-screen Mapbox GL map
   - Location markers with clustering
   - Bounding box queries on pan/zoom
   - Current location button

2. **Location Details**
   - Bottom sheet on marker tap
   - Type, description, season, access info
   - Photos (future)
   - Directions link

3. **Search & Filter**
   - Search by type name
   - Filter by category (forager, honeybee, etc.)
   - Filter by season

4. **PWA**
   - Installable on mobile
   - Offline map tile caching
   - Service worker for API caching

### Mobile-First Design

- Touch targets: 44x44px minimum
- Bottom navigation
- Swipe gestures for sheets
- Pull-to-refresh
- Responsive to desktop

### Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 200KB gzipped

## Key Data Insights

- **1.9M+ locations** worldwide
- **4K+ plant types** with scientific names
- **Top types:** Sugar maple (22K), Honey locust (18K), Apple (3K)
- **Categories:** forager (edible), honeybee (bee forage), grafter, freegan
- **89% verified** locations
- **Localized names** in 17 languages

## API Usage Patterns

### Map Viewport Query

```typescript
// When user pans/zooms the map
const bounds = map.getBounds();
const response = await fetch(
  `${API_URL}/api/locations?` +
  `sw_lat=${bounds.getSouth()}&sw_lng=${bounds.getWest()}` +
  `&ne_lat=${bounds.getNorth()}&ne_lng=${bounds.getEast()}` +
  `&limit=1000`
);
```

### Type Filter

```typescript
// Filter by apple trees
const response = await fetch(
  `${API_URL}/api/locations?sw_lat=...&types=114,1566`
);
```

### Search Types

```typescript
// Search for "cherry"
const response = await fetch(
  `${API_URL}/api/types?search=cherry`
);
```

## Deployment

### Backend (Automatic)

Push to `main` branch triggers:
1. SSH into EC2
2. rsync backend files
3. Docker build + restart
4. Data import (if DB missing)

### Frontend (TODO)

Options:
- Vercel (recommended for Vite)
- Netlify
- AWS S3 + CloudFront
- Same EC2 with nginx

## Next Steps

1. **Initialize React project** with Vite + TypeScript
2. **Set up Tailwind CSS** with custom theme
3. **Integrate Mapbox GL** with markers
4. **Create API client** with TanStack Query
5. **Build location sheet** component
6. **Add type filtering** UI
7. **Configure PWA** with offline support
8. **Deploy frontend** to Vercel/Netlify

## Resources

- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Falling Fruit](https://fallingfruit.org/)
- [API Swagger Docs](http://ec2-16-144-65-155.us-west-2.compute.amazonaws.com:8000/docs)

