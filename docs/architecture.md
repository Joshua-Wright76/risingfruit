# Rising Fruit Architecture

A mobile-first Progressive Web App client for the Falling Fruit urban foraging platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Rising Fruit PWA                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │    React     │  │   Mapbox GL  │  │   Service Worker     │   │
│  │  Components  │  │     Map      │  │  (Offline Support)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐  │
│  │                    TanStack Query                          │  │
│  │              (Data Fetching & Caching)                     │  │
│  └──────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
      ┌───────────────┐ ┌───────────┐ ┌─────────────┐
      │ Falling Fruit │ │  Mapbox   │ │   Browser   │
      │     API       │ │   Tiles   │ │   Storage   │
      └───────────────┘ └───────────┘ └─────────────┘
```

## Directory Structure

```
risingfruit/
├── .cursor/
│   └── rules/
│       └── risingfruit.mdc    # Agent context rules
├── docs/
│   ├── api-reference.md       # Falling Fruit API docs
│   └── architecture.md        # This file
├── public/
│   ├── icons/                 # PWA icons
│   ├── favicon.ico
│   └── manifest.json          # PWA manifest (generated)
├── src/
│   ├── components/            # React components
│   │   ├── ui/               # Base UI primitives
│   │   ├── map/              # Map-specific components
│   │   ├── location/         # Location display components
│   │   └── layout/           # App shell components
│   ├── features/             # Feature modules
│   │   ├── browse/           # Map browsing
│   │   ├── search/           # Search functionality
│   │   ├── location/         # Location details
│   │   ├── contribute/       # Add/edit locations
│   │   └── auth/             # Authentication
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Libraries and utilities
│   │   ├── api/              # API client
│   │   ├── mapbox/           # Map configuration
│   │   └── utils/            # Helpers
│   ├── types/                # TypeScript definitions
│   ├── styles/               # Global styles
│   ├── assets/               # Static assets
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite types
├── .env.example              # Environment template
├── .gitignore
├── index.html                # HTML entry
├── package.json
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite + PWA config
└── README.md
```

## Core Modules

### 1. Map Module (`src/components/map/`)

The map is the primary interface for the application.

**Components:**
- `ForagingMap.tsx` - Main map component with Mapbox GL
- `LocationMarker.tsx` - Individual location markers
- `ClusterMarker.tsx` - Clustered location markers
- `MapControls.tsx` - Zoom, locate me, layers
- `MapOverlay.tsx` - Loading states, offline indicator

**Data Flow:**
```
User pans/zooms map
        │
        ▼
Map bounds change event
        │
        ▼
TanStack Query fetches locations for bounds
        │
        ▼
Supercluster processes locations into clusters
        │
        ▼
Markers rendered on map
```

### 2. API Module (`src/lib/api/`)

Centralized API communication layer.

**Files:**
- `client.ts` - HTTP client configuration (ky or fetch)
- `locations.ts` - Location endpoints and hooks
- `types.ts` - Plant type endpoints and hooks
- `reviews.ts` - Review endpoints and hooks
- `auth.ts` - Authentication endpoints and hooks

**Pattern:**
```typescript
// Example: src/lib/api/locations.ts
export function useLocations(bounds: Bounds) {
  return useQuery({
    queryKey: ['locations', bounds],
    queryFn: () => fetchLocations(bounds),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(bounds),
  });
}

export function useLocationDetails(id: number) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => fetchLocation(id),
  });
}

export function useCreateLocation() {
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
```

### 3. UI Components (`src/components/ui/`)

Reusable, styled primitives.

**Components:**
- `Button.tsx` - Primary, secondary, ghost variants
- `Input.tsx` - Text inputs with validation states
- `Card.tsx` - Content container
- `Sheet.tsx` - Bottom sheet (mobile pattern)
- `Modal.tsx` - Dialog/modal
- `Badge.tsx` - Status indicators
- `Skeleton.tsx` - Loading placeholders
- `Toast.tsx` - Notifications

### 4. Features (`src/features/`)

Domain-specific modules combining components and logic.

#### Browse Feature
- Map view with location markers
- Filter by plant type
- Location preview cards

#### Search Feature
- Full-text search
- Type filtering
- Location-based search ("near me")

#### Location Feature
- Location detail view
- Photos gallery
- Reviews list
- Directions/navigation

#### Contribute Feature
- Add new location form
- Edit existing location
- Photo upload
- Review submission

#### Auth Feature
- Sign in / Sign up
- Password reset
- Profile management

## Data Flow

### Fetching Locations

```
┌─────────┐    bounds    ┌─────────────┐   HTTP    ┌─────────────┐
│   Map   │─────────────▶│ TanStack    │──────────▶│ Falling     │
│Component│              │ Query       │           │ Fruit API   │
└─────────┘              └─────────────┘           └─────────────┘
     ▲                         │                         │
     │                         │ cache                   │
     │                         ▼                         │
     │                  ┌─────────────┐                  │
     │                  │  Query      │                  │
     │                  │  Cache      │                  │
     │                  └─────────────┘                  │
     │                         │                         │
     │         locations       │      locations          │
     └─────────────────────────┴─────────────────────────┘
```

### Offline Mutation Queue

```
User creates location (offline)
        │
        ▼
Mutation added to queue (IndexedDB)
        │
        ▼
Service Worker detects online
        │
        ▼
Queue processed, API called
        │
        ▼
Cache invalidated, UI updated
```

## State Management

### Server State (TanStack Query)
- All API data
- Automatic caching and revalidation
- Optimistic updates for mutations

### Client State (React Context / Zustand)
- UI state (active filters, selected location)
- User preferences (map style, units)
- Auth state (current user, tokens)

### Persisted State (localStorage / IndexedDB)
- Favorited locations
- Offline queue
- User preferences

## PWA Architecture

### Service Worker Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Service Worker                          │
├───────────────────┬─────────────────┬───────────────────────┤
│   Precache        │  Runtime Cache  │   Background Sync     │
│   ───────────     │  ─────────────  │   ───────────────     │
│   - App shell     │  - API responses│   - Mutation queue    │
│   - Static assets │  - Map tiles    │   - Retry failed      │
│   - Fonts         │  - Images       │     requests          │
└───────────────────┴─────────────────┴───────────────────────┘
```

### Caching Strategy by Resource Type

| Resource | Strategy | TTL |
|----------|----------|-----|
| App shell (JS/CSS) | Precache | Until update |
| API - Locations | Network First | 1 hour |
| API - Types | Cache First | 24 hours |
| Map tiles | Cache First | 30 days |
| User photos | Cache First | 7 days |

## Security Considerations

- API keys stored in environment variables
- Mapbox token restricted by domain
- HTTPS enforced
- No sensitive data in localStorage
- Input sanitization for user content

## Performance Optimizations

1. **Code Splitting** - Route-based lazy loading
2. **Map Tiles** - Aggressive caching, low-res fallbacks
3. **Images** - WebP format, lazy loading, srcset
4. **Clustering** - Supercluster for thousands of markers
5. **Virtualization** - Long lists use windowing
6. **Bundle Analysis** - Keep initial load < 200KB gzipped

## Development Workflow

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint
```

## Environment Configuration

```bash
# .env.local (development)
VITE_API_BASE_URL=https://fallingfruit.org/api/
VITE_MAPBOX_TOKEN=pk.xxx
VITE_APP_ENV=development

# .env.production
VITE_API_BASE_URL=https://fallingfruit.org/api/
VITE_MAPBOX_TOKEN=pk.xxx
VITE_APP_ENV=production
```

## Future Considerations

- **Native Features** - Capacitor wrapper for app stores
- **Push Notifications** - Seasonal reminders
- **Social Features** - Following users, sharing finds
- **Gamification** - Badges, contribution streaks
- **AR Mode** - Camera overlay for location finding



