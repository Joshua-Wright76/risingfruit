# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rising Fruit is a PWA providing a mobile-first interface for the Falling Fruit urban foraging database. It features a self-hosted backend that syncs data from Falling Fruit's CSV exports.

Instructions from the User:
Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

## Architecture

```
Frontend (React + Vite + Mantine + Mapbox GL)
          │
          ▼ HTTP/JSON
Backend (FastAPI + SQLite with R-tree spatial index)
          │
          ▼ Nightly sync
Falling Fruit CSV exports (locations.csv.bz2, types.csv.bz2)
```

- **Frontend:** `frontend/` - React 19, TypeScript, Mantine 8, Mapbox GL, TanStack Query, Playwright E2E
- **Backend:** `backend/` - FastAPI, SQLite with R-tree spatial indexing, Docker
- **Deployment:** AWS EC2 via GitHub Actions CI/CD with Nginx reverse proxy and Let's Encrypt SSL

## Common Commands

### Frontend

```bash
cd frontend
npm ci                  # Install dependencies
npm run dev             # Start dev server (localhost:5173)
npm run build           # Production build
npm run lint            # ESLint check
npm test                # Run all Playwright E2E tests
npm run test:ui         # Playwright UI mode (visual debugging)
npm run test:headed     # Playwright with visible browser
npx playwright test markers.spec.ts  # Run single test file
```

### Backend

```bash
cd backend
docker-compose build    # Build Docker image
docker-compose up -d    # Start services
docker-compose down     # Stop services
docker-compose logs -f  # View logs

# Data sync (downloads Falling Fruit CSVs)
./scripts/sync-data.sh
./scripts/sync-data.sh --force  # Force re-download
```

## Key Files

### Frontend
- `src/router.tsx` - React Router config (`/` → LandingPage, `/app` → AppPage)
- `src/pages/LandingPage.tsx` - Marketing landing page with sections
- `src/pages/AppPage.tsx` - Main map application page
- `src/components/landing/` - Landing page sections (Navbar, Hero, Features, LiveStats, Screenshots, Founder, Contact, Footer)
- `src/components/Map.tsx` - Main Mapbox map component with marker rendering
- `src/components/LocationSheet.tsx` - Bottom sheet for location details (uses React Portal + inline styles for z-index)
- `src/components/FruitIcons.ts` - Emoji markers and custom SVG icons
- `src/lib/api.ts` - Backend API client
- `src/lib/typeIdMappings.ts` - Falling Fruit type ID to emoji/icon mapping
- `src/lib/fruitSeasons.ts` - Season calculation logic
- `src/theme.ts` - Mantine theme (surface/primary/accent color scales)
- `e2e/fixtures/test-fixtures.ts` - Custom Playwright fixtures with map helpers

### Backend
- `src/main.py` - FastAPI app, all routes, Pydantic models
- `src/database.py` - Async SQLite wrapper with query helpers
- `db/schema.sql` - SQLite schema with R-tree index and triggers
- `db/import.py` - CSV to SQLite import script

## API Endpoints

All prefixed with `/api`:
- `GET /api/health` - Health check
- `GET /api/stats` - Database statistics
- `GET /api/locations` - Query by bounding box (params: `sw_lat`, `sw_lng`, `ne_lat`, `ne_lng`, `types`, `limit`, `verified_only`)
- `GET /api/locations/{id}` - Single location with types
- `GET /api/types` - List types (params: `category`, `search`)
- `GET /api/types/{id}` - Single type details

## Database

SQLite with R-tree spatial indexing:
- `locations` - Foraging locations (~2M rows)
- `types` - Plant/food definitions (~4K rows)
- `location_types` - Junction table
- `locations_rtree` - Virtual R-tree index (auto-synced via triggers)

## Environment Variables

Frontend `.env.local`:
```bash
VITE_API_BASE_URL=https://16.144.65.155.sslip.io
VITE_MAPBOX_TOKEN=pk.your_token_here
```

GitHub Secrets for deployment: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `MAPBOX_TOKEN`

## Technical Decisions

- **LocationSheet uses inline styles** instead of Tailwind because React Portal content needs explicit z-index to render above Mapbox canvas
- **Marker click uses 40x40px bounding box** around click point for better mobile touch targets
- **R-tree index** enables O(log n) spatial queries on ~2M locations
- **WAL mode + 64MB cache** for SQLite performance
- **Landing page at `/`** with marketing sections; main app at `/app`

## Test Selectors

```
data-testid="filter-panel"
data-testid="location-sheet"
data-testid="season-filter"
placeholder="Search plants..."
```
