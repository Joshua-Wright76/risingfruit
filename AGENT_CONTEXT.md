# Rising Fruit - Agent Context

> A mobile-first PWA client for the Falling Fruit urban foraging map.

## Project Overview

Rising Fruit is a Progressive Web App that provides a modern, mobile-first interface for discovering and sharing urban foraging locations. It consumes data from the [Falling Fruit](https://fallingfruit.org/) open-source foraging database.

**Current Status:** Frontend complete, deployed to production on EC2.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Rising Fruit PWA (Complete)                  │
│  React + Vite + TypeScript + Mantine + Mapbox GL + react-map-gl │
│  Dark mode • Custom fruit icons • PWA with offline caching      │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Rising Fruit Backend (EC2)                    │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐     │
│  │ Data Sync   │───▶│   SQLite     │◀───│   FastAPI       │     │
│  │ (CSV)       │    │   + R-tree   │    │   REST API      │     │
│  └─────────────┘    └──────────────┘    │ + Static Files  │     │
│                                          └─────────────────┘     │
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
https://16.144.65.155.sslip.io
```

> **Note:** Production domain is risingfruit.com (SSL certificate pending setup)

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
curl "https://16.144.65.155.sslip.io/api/locations?sw_lat=37.7&sw_lng=-122.5&ne_lat=37.8&ne_lng=-122.4&limit=100"
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
https://16.144.65.155.sslip.io/docs
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

### Frontend (Complete)

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript |
| UI Library | Mantine |
| Maps | Mapbox GL JS + react-map-gl |
| State Management | TanStack Query |
| PWA | vite-plugin-pwa |
| Testing | Playwright E2E |

## Project Structure

```
risingfruit/
├── .cursor/rules/risingfruit.mdc   # Agent rules
├── .github/workflows/deploy.yml    # CI/CD pipeline (backend + frontend)
├── backend/
│   ├── db/
│   │   ├── schema.sql              # SQLite schema
│   │   └── import.py               # CSV import script
│   ├── src/
│   │   ├── main.py                 # FastAPI app + static file serving
│   │   └── database.py             # DB utilities
│   ├── scripts/
│   │   └── sync-data.sh            # Data download script
│   ├── data/                       # CSV + SQLite (gitignored)
│   ├── frontend/dist/              # Built frontend (deployed)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # Marketing landing page (route: /)
│   │   │   └── AppPage.tsx         # Main map application (route: /app)
│   │   ├── components/
│   │   │   ├── landing/            # Landing page sections
│   │   │   │   ├── Navbar.tsx      # Navigation bar
│   │   │   │   ├── Hero.tsx        # Hero section with CTA
│   │   │   │   ├── Features.tsx    # Feature highlights
│   │   │   │   ├── LiveStats.tsx   # Live database statistics
│   │   │   │   ├── Screenshots.tsx # App screenshots
│   │   │   │   ├── Founder.tsx     # Founder info section
│   │   │   │   ├── Contact.tsx     # Contact form
│   │   │   │   └── Footer.tsx      # Footer
│   │   │   ├── Map.tsx             # Main map with markers & clustering
│   │   │   ├── CompassRose.tsx     # Compass rose overlay for 3D mode
│   │   │   ├── LocationSheet.tsx   # Detail bottom sheet (React Portal)
│   │   │   ├── SearchBar.tsx       # Type search with autocomplete
│   │   │   ├── FilterPanel.tsx     # Category & season filters
│   │   │   ├── EmptyState.tsx      # No results message
│   │   │   ├── LoadingSkeleton.tsx # Map loading state
│   │   │   ├── FruitIcons.ts       # Custom marker icon data URIs
│   │   │   └── MarkerIcons.ts      # Marker icon loading utilities
│   │   ├── lib/
│   │   │   └── api.ts              # API client functions
│   │   ├── types/
│   │   │   └── location.ts         # TypeScript interfaces
│   │   ├── router.tsx              # React Router config
│   │   ├── App.tsx                 # Root component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── e2e/                        # Playwright E2E tests
│   │   ├── fixtures/test-fixtures.ts
│   │   ├── map.spec.ts
│   │   ├── markers.spec.ts
│   │   ├── search.spec.ts
│   │   └── filters.spec.ts
│   ├── public/
│   │   ├── icons/                  # PWA icons
│   │   ├── leaf.svg                # Favicon
│   │   └── manifest.json           # PWA manifest
│   ├── playwright.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── docs/
│   ├── api-reference.md
│   └── architecture.md
├── .env.local                      # Local secrets (gitignored)
├── .gitignore
└── AGENT_CONTEXT.md                # This file
```

## Frontend Features (Implemented)

### Landing Page (route: `/`)
- Modern marketing landing page with dark theme
- **Navbar** - Navigation with smooth scroll links and "Open App" CTA
- **Hero** - Headline, description, and call-to-action buttons
- **Features** - Key feature highlights with icons
- **LiveStats** - Real-time database statistics (locations, types, verified %)
- **Screenshots** - App screenshot gallery
- **Founder** - Founder information section
- **Contact** - Contact form for user inquiries
- **Footer** - Links and copyright

### Map View (route: `/app`)
- Full-screen Mapbox GL map with dark theme
- Location markers with Supercluster clustering
- Custom fruit icons for 31 plant types (banana, apple, orange, etc.)
- Generic leaf icon fallback for other types
- Default location: Long Beach, CA

### Compass Mode (3D Navigation)
Two separate buttons on the right side of the map:

**Geolocation Button** (Crosshair icon)
- Centers map on user's current GPS location
- One-time center, no tracking
- Uses `data-testid="geolocate-button"` for E2E tests

**Compass Mode Button** (Navigation2 icon)
- Activates full 3D compass navigation mode
- Centers on user location + tilts to 60° pitch + zooms to 17
- Rotates map to match device compass heading (user faces "up")
- Continuously tracks GPS position while active
- Icon rotates to show current heading

**Compass Rose Overlay** (`CompassRose.tsx`)
- Large semi-transparent compass rose (Pokemon Go style)
- Fixed on screen, rotates with heading
- Shows N/S/E/W markers with highlighted North indicator
- Visible only when compass mode is active

**Exit Behavior**
- Manual pan/drag exits compass mode automatically
- Map stays at current position (no snap back)
- Re-tapping compass button snaps back to GPS and re-enables tracking

**Technical Details**
- Uses `DeviceOrientationEvent` API for compass heading
- iOS 13+ permission request handled (`DeviceOrientationEvent.requestPermission()`)
- Exponential moving average smoothing on heading (SMOOTHING_FACTOR = 0.15)
- Falls back to non-rotating mode if orientation permission denied
- Event listeners cleaned up via refs on unmount

### Location Detail Sheet
- Slide-up bottom sheet on marker tap
- Uses React Portal for proper z-index stacking
- Shows: type name, scientific name, description, season, access
- "Get Directions" button (Apple Maps on iOS, Google Maps elsewhere)
- Share button with Web Share API / clipboard fallback
- Close via X button, click outside, or Escape key

### Search & Filters
- Type search with autocomplete dropdown
- Category filter pills (Forager, Honeybee, Grafter, Freegan)
- Season filter toggle ("In season now")
- Clear all filters button
- Empty state when no results

### PWA Support
- Installable on mobile devices
- App manifest with icons
- Service worker for offline caching
- Caches: map tiles, API responses, Google Fonts

### Dark Mode
- Dark theme by default (`mapbox://styles/mapbox/dark-v11`)
- Custom dark color palette defined in frontend/src/lib/colors.ts

## Technical Decisions

### LocationSheet Styling
The LocationSheet uses React Portal with Mantine components. The sheet needs to render above the Mapbox canvas to avoid z-index issues.

### Marker Click Detection
Click detection uses a 40x40px bounding box around the click point:
```typescript
const bbox = [
  [e.point.x - 20, e.point.y - 20],
  [e.point.x + 20, e.point.y + 20]
];
const features = map.queryRenderedFeatures(bbox);
```
This improves touch targets on mobile where precise clicks are difficult.

### Feature Querying
The map queries all rendered features at the click point, then filters by layer ID:
```typescript
const allFeatures = map.queryRenderedFeatures(bbox);
const ourLayers = ['clusters', 'unclustered-point', 'unclustered-point-fallback'];
const features = allFeatures.filter(f => ourLayers.includes(f.layer?.id || ''));
```
This is more reliable than passing `layers` option directly to `queryRenderedFeatures`.

## Environment Variables

```bash
# frontend/.env.local

# Backend API (defaults to same-origin in production)
VITE_API_BASE_URL=https://16.144.65.155.sslip.io

# Mapbox (required - get from mapbox.com)
VITE_MAPBOX_TOKEN=pk.your_token_here
```

### GitHub Secrets (for deployment)

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 hostname |
| `EC2_USER` | SSH username |
| `EC2_SSH_KEY` | SSH private key |
| `MAPBOX_TOKEN` | Mapbox access token for production builds |

## Deployment

### Automatic (GitHub Actions)

Push to `main` branch triggers:
1. Run Playwright E2E tests
2. Build frontend (`npm run build` with `VITE_MAPBOX_TOKEN`)
3. SSH into EC2
4. rsync backend files (excluding frontend/)
5. rsync frontend/dist to backend/frontend/dist
6. Docker build + restart
7. FastAPI serves static frontend files

### Manual Testing

```bash
# Run frontend locally
cd frontend
npm install
npm run dev

# Run E2E tests
npm run test:e2e
```

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

## Next Steps (Future Enhancements)

1. **Additional fruit icons** - Expand from 31 to cover more common types
2. **User authentication** - Allow users to log in
3. **Location submissions** - Let users add new foraging spots
4. **Photo support** - Upload and display location photos
5. **Offline location caching** - Cache visited locations for offline viewing
6. **Route planning** - Multi-stop foraging route optimization
7. **Notifications** - Alert when types are in season

## Resources

- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [react-map-gl](https://visgl.github.io/react-map-gl/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Playwright](https://playwright.dev/)
- [Falling Fruit](https://fallingfruit.org/)
- [API Swagger Docs](https://16.144.65.155.sslip.io/docs)
