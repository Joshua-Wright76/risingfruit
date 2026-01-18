# Google Street View Integration Research

**Date:** January 18, 2026
**Purpose:** Evaluate feasibility of integrating Street View imagery to show fruit location surroundings

## Executive Summary

✅ **Feasibility:** YES - Google Street View Static API can be integrated to show street-level imagery of fruit locations.

**Key Findings:**
- **Metadata requests are FREE** - check coverage without cost
- **Panorama images cost $0.007/request** ($7 per 1,000 images)
- **Max image size:** 640x640 pixels
- **Coverage check:** Can programmatically verify if Street View exists before displaying
- **React integration:** Multiple libraries available, or simple `<img>` tag for static approach

## Technical Approaches

### Approach 1: Static API (Recommended for MVP)

**Description:** Display a static Street View image using a simple `<img>` tag.

**Pros:**
- Simplest implementation
- Lightweight (no extra JavaScript)
- Low bandwidth usage
- Perfect for mobile

**Cons:**
- Non-interactive (can't pan/rotate)
- Fixed view angle

**Cost:** $7 per 1,000 images loaded

**Implementation:**
```tsx
// Check coverage first (FREE)
const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?` +
  `location=${lat},${lng}&key=${API_KEY}`;

const response = await fetch(metadataUrl);
const data = await response.json();

if (data.status === 'OK') {
  // Street View available - show image
  const imageUrl = `https://maps.googleapis.com/maps/api/streetview?` +
    `size=640x400&location=${lat},${lng}` +
    `&fov=90&heading=${heading}&pitch=0` +
    `&key=${API_KEY}`;

  return <img src={imageUrl} alt="Street View" />;
}
```

### Approach 2: JavaScript API (Interactive)

**Description:** Embed interactive Street View panorama using Google Maps JavaScript API.

**Pros:**
- Fully interactive (pan, zoom, rotate)
- Better user experience
- Can show multiple angles

**Cons:**
- Larger JavaScript bundle
- Higher bandwidth
- More complex implementation
- Higher cost per view

**Cost:** $14 per 1,000 dynamic views

**React Library Options:**
- [`react-streetview`](https://github.com/elcsiga/react-streetview) - 47 stars
- [`react-google-streetview`](https://github.com/alexus37/react-google-streetview) - Popular with CodeSandbox examples

## API Details

### Metadata Endpoint (FREE)

**Endpoint:**
```
GET https://maps.googleapis.com/maps/api/streetview/metadata?location=LAT,LNG&key=API_KEY
```

**Response when available:**
```json
{
  "status": "OK",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "pano_id": "abc123xyz",
  "date": "2023-07"
}
```

**Response when NOT available:**
```json
{
  "status": "ZERO_RESULTS"
}
```

**Key Benefit:** Query this endpoint before displaying Street View to:
1. Check if imagery exists at that location
2. Get the actual panorama location (may be offset from fruit location)
3. Determine if location is close enough to a street
4. **All at ZERO cost** - metadata requests don't count against quota

### Static Image API (Paid)

**Base URL:**
```
https://maps.googleapis.com/maps/api/streetview?parameters
```

**Key Parameters:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `size` | Image dimensions (max 640x640) | `640x400` |
| `location` | Lat/lng coordinates | `37.7749,-122.4194` |
| `heading` | Camera direction (0-360°, 0=North) | `90` (East) |
| `pitch` | Camera angle (-90 to 90°, 0=horizon) | `0` |
| `fov` | Field of view (10-120°, default 90°) | `90` |
| `key` | Google API key | `YOUR_API_KEY` |
| `radius` | Search radius in meters (max 50) | `50` |

**Example URL:**
```
https://maps.googleapis.com/maps/api/streetview?
  size=640x400&
  location=37.7749,-122.4194&
  heading=90&
  pitch=0&
  fov=90&
  key=YOUR_API_KEY
```

## Pricing Analysis

### Current Google Maps Platform Pricing (2026)

| Service | Cost | Notes |
|---------|------|-------|
| **Metadata requests** | **FREE** | Unlimited coverage checks |
| **Static Street View** | $7 / 1,000 requests | $0.007 per image |
| **Dynamic Street View** | $14 / 1,000 loads | $0.014 per panorama |

### Free Tier Changes (2026)
- Monthly $200 credit ended March 1, 2025
- Now replaced by API-specific free usage thresholds
- Billing must be enabled
- API key required for all requests

### Cost Estimation for Rising Fruit

**Assumptions:**
- 1,000 active users/month
- Each user views 10 location details
- 50% of locations have Street View coverage
- Static API implementation

**Monthly cost calculation:**
```
1,000 users × 10 locations × 50% coverage = 5,000 images
5,000 images × $0.007 = $35/month
```

**Cost optimization strategies:**
1. **Cache images** - Store Street View images to avoid repeat requests
2. **Lazy load** - Only load when user scrolls to Street View section
3. **Metadata pre-check** - Don't show Street View UI if unavailable (FREE check)
4. **User preference** - Add toggle to disable Street View for data-conscious users

## Implementation Strategy

### Phase 1: MVP (Static Images)

**Goal:** Add static Street View preview to LocationSheet

**Steps:**
1. Add Google Maps API key to environment variables
2. Create `StreetViewPreview` component
3. Add metadata check hook to verify coverage
4. Display 640x400px static image in LocationSheet
5. Add loading skeleton and error states

**UI Placement:** Between description and info grid in LocationSheet

**Code Structure:**
```tsx
// components/StreetViewPreview.tsx
export function StreetViewPreview({ lat, lng }: Props) {
  const { data, isLoading } = useStreetViewMetadata(lat, lng);

  if (!data?.available) return null;

  return (
    <Box>
      <Text size="xs" fw={500} c="gray.5" tt="uppercase" mb={8}>
        Street View
      </Text>
      <img
        src={getStreetViewUrl(lat, lng, data.heading)}
        alt="Street View"
        style={{ borderRadius: 12, width: '100%' }}
      />
    </Box>
  );
}
```

### Phase 2: Enhanced Experience (Optional)

**Enhancements:**
1. **Multiple angles** - Show 4 cardinal directions (N, E, S, W)
2. **Interactive panorama** - Upgrade to JavaScript API on user tap
3. **Smart heading** - Calculate optimal viewing angle based on street direction
4. **Thumbnails** - Show small preview, expand on tap

### Phase 3: Advanced Features (Future)

1. **Photo carousel** - Combine Street View with user-uploaded photos
2. **Temporal slider** - Show Street View history (if available)
3. **AR integration** - Overlay fruit location on live camera view
4. **Offline caching** - Download Street View for saved locations

## UI/UX Considerations

### Mobile-First Design

**Constraints:**
- LocationSheet has `maxHeight: 70vh`
- Already shows: header, description, season, access, types, actions
- Need to avoid overwhelming users with too much content

**Recommendations:**

**Option A: Collapsible Section**
```tsx
<Accordion>
  <Accordion.Item value="street-view">
    <Accordion.Control>Street View</Accordion.Control>
    <Accordion.Panel>
      <StreetViewPreview lat={lat} lng={lng} />
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

**Option B: Thumbnail with Expand**
```tsx
<Box onClick={() => setExpanded(true)}>
  <img src={thumbnailUrl} style={{ height: 120 }} />
  <Text size="xs">Tap to expand</Text>
</Box>
```

**Option C: Tab System**
```tsx
<Tabs>
  <Tabs.Tab value="details">Details</Tabs.Tab>
  <Tabs.Tab value="street-view">Street View</Tabs.Tab>
  <Tabs.Tab value="photos">Photos</Tabs.Tab>
</Tabs>
```

### Accessibility

- Add alt text: "Street View of {type.en_name} location"
- Keyboard navigation for expanded view
- Screen reader announcements for loading/error states
- High contrast borders for low vision users

### Performance

**Image optimization:**
- Use `loading="lazy"` attribute
- Responsive sizes: 320px (mobile), 640px (tablet)
- WebP format if Google supports it
- Show loading skeleton during fetch

**Bundle size:**
- Static API: 0 KB (just `<img>` tag)
- JavaScript API: ~50KB additional bundle

## Coverage Limitations

### When Street View May Not Be Available

1. **Rural areas** - Many foraging locations in remote forests/fields
2. **Private property** - Google doesn't photograph private land
3. **Recent locations** - Newly added locations may not have coverage
4. **International gaps** - Coverage varies by country

### Handling No Coverage

**Strategy:** Pre-check with metadata API, hide Street View section entirely

```tsx
const { data } = useStreetViewMetadata(lat, lng);

// Don't render anything if no coverage
if (data?.status !== 'OK') return null;

// Only show Street View if available
return <StreetViewPreview ... />;
```

## Security & Privacy

### API Key Security

**DO:**
- Use environment variables for API key
- Restrict API key to specific domains (risingfruit.com)
- Restrict API key to Street View Static API only
- Monitor usage in Google Cloud Console

**DON'T:**
- Commit API key to Git
- Use same key for server-side operations
- Share key across multiple projects

### User Privacy

- Street View images are public data
- No additional user consent needed
- Consider adding "What's this?" tooltip explaining Street View

## Setup Requirements

### Google Cloud Console

1. Create new project or use existing
2. Enable "Street View Static API"
3. Create API key with restrictions:
   - HTTP referrers: `risingfruit.com/*`, `16.144.65.155.sslip.io/*`
   - API restrictions: Street View Static API only
4. Enable billing (required even for free tier)

### Environment Variables

```bash
# frontend/.env.local
VITE_GOOGLE_MAPS_API_KEY=pk.your_key_here

# GitHub Secrets (for deployment)
GOOGLE_MAPS_API_KEY=pk.your_key_here
```

### Frontend Dependencies

**Static approach:** None! Just use `<img>` tag

**Interactive approach:**
```bash
npm install @googlemaps/js-api-loader
# or
npm install react-google-streetview
```

## Example Implementation

### Hook: useStreetViewMetadata

```tsx
// hooks/useStreetViewMetadata.ts
import { useQuery } from '@tanstack/react-query';

interface StreetViewMetadata {
  status: 'OK' | 'ZERO_RESULTS';
  location?: { lat: number; lng: number };
  pano_id?: string;
  date?: string;
}

export function useStreetViewMetadata(lat: number, lng: number) {
  return useQuery({
    queryKey: ['streetview-metadata', lat, lng],
    queryFn: async () => {
      const url = `https://maps.googleapis.com/maps/api/streetview/metadata?` +
        `location=${lat},${lng}&` +
        `radius=50&` +
        `key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data: StreetViewMetadata = await response.json();

      return {
        available: data.status === 'OK',
        ...data,
      };
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    enabled: !!lat && !!lng,
  });
}
```

### Component: StreetViewPreview

```tsx
// components/StreetViewPreview.tsx
import { Box, Text, Skeleton, Image } from '@mantine/core';
import { useStreetViewMetadata } from '../hooks/useStreetViewMetadata';

interface StreetViewPreviewProps {
  lat: number;
  lng: number;
}

export function StreetViewPreview({ lat, lng }: StreetViewPreviewProps) {
  const { data, isLoading } = useStreetViewMetadata(lat, lng);

  // Don't render if no coverage
  if (!isLoading && !data?.available) return null;

  const imageUrl = data?.available
    ? `https://maps.googleapis.com/maps/api/streetview?` +
      `size=640x400&` +
      `location=${lat},${lng}&` +
      `fov=90&` +
      `pitch=0&` +
      `key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    : '';

  return (
    <Box>
      <Text
        size="xs"
        fw={500}
        c="gray.5"
        tt="uppercase"
        style={{ letterSpacing: '0.05em' }}
        mb={8}
      >
        Street View
      </Text>

      {isLoading ? (
        <Skeleton height={200} radius={12} />
      ) : (
        <Image
          src={imageUrl}
          alt={`Street view near location`}
          radius={12}
          fit="cover"
          h={200}
        />
      )}

      <Text size="xs" c="gray.6" mt={4}>
        Approximate view from nearest street
      </Text>
    </Box>
  );
}
```

### Integration in LocationSheet

```tsx
// In LocationContent component, add between description and info grid:

{location.description && (
  <Text c="gray.3" lh={1.6}>
    {location.description}
  </Text>
)}

{/* NEW: Street View Preview */}
<StreetViewPreview lat={location.lat} lng={location.lng} />

{/* Info grid */}
<SimpleGrid cols={2} spacing={12}>
  ...
</SimpleGrid>
```

## Recommended Approach

**For Rising Fruit, I recommend:**

### ✅ Start with Static API

**Rationale:**
1. **Cost-effective** - $7/1k vs $14/1k for dynamic
2. **Simple** - No new dependencies
3. **Fast** - Images load quickly
4. **Mobile-friendly** - Fixed view perfect for small screens
5. **Free coverage check** - Metadata API ensures we only show available views

### 📊 Phased Rollout

**Week 1-2: MVP**
- Add Google Maps API key
- Implement `useStreetViewMetadata` hook
- Create `StreetViewPreview` component
- Add to LocationSheet (only when coverage exists)
- Test with ~10 locations across urban/rural divide

**Week 3-4: Refinement**
- Add loading states
- Implement error handling
- Optimize image caching
- A/B test user engagement

**Future: Enhanced Features**
- Consider interactive panorama for "View in 3D" button
- Add multiple viewing angles
- Integrate with photo upload feature

## Potential Issues & Solutions

### Issue 1: Rural Location Coverage

**Problem:** Many fruit trees in rural areas without Street View

**Solution:**
- Metadata check ensures we only show when available
- Show graceful "Street View not available" if user expects it
- Consider satellite view as fallback

### Issue 2: Outdated Imagery

**Problem:** Street View may show location before tree was planted

**Solution:**
- Display capture date from metadata API
- Add disclaimer: "Street View may not show current conditions"
- Show date badge: "Image from July 2023"

### Issue 3: Cost Overruns

**Problem:** Unexpected high usage drives costs

**Solution:**
- Set budget alerts in Google Cloud Console
- Implement aggressive caching (24-hour stale time)
- Add usage analytics to track requests
- Consider lazy loading (only load when user scrolls to section)

### Issue 4: Slow Loading

**Problem:** Images take time to load on slow networks

**Solution:**
- Show skeleton loader during fetch
- Use low-quality placeholder (LQIP) technique
- Implement intersection observer for lazy loading
- Consider thumbnail first, full-size on demand

## Next Steps

If you'd like to proceed with this integration:

1. **Setup Google Cloud:**
   - Create/configure Google Cloud project
   - Enable Street View Static API
   - Generate restricted API key
   - Add to GitHub Secrets

2. **Implement MVP:**
   - Add `useStreetViewMetadata` hook
   - Create `StreetViewPreview` component
   - Integrate into `LocationSheet`
   - Add loading/error states

3. **Test & Iterate:**
   - Test with various locations (urban, rural, international)
   - Monitor costs in Google Cloud Console
   - Gather user feedback
   - Optimize based on usage patterns

4. **Document:**
   - Update CLAUDE.md with Street View integration details
   - Add API key setup to README
   - Document cost monitoring process

## References

- [Street View Static API Overview](https://developers.google.com/maps/documentation/streetview/overview)
- [Street View Metadata API](https://developers.google.com/maps/documentation/streetview/metadata)
- [Street View Pricing (2026)](https://developers.google.com/maps/documentation/streetview/usage-and-billing)
- [Street View JavaScript API](https://developers.google.com/maps/documentation/javascript/streetview)
- [react-streetview Library](https://github.com/elcsiga/react-streetview)
- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)

---

**Summary:** Google Street View integration is technically feasible and cost-effective for Rising Fruit. The Static API approach offers the best balance of simplicity, performance, and cost for a mobile-first PWA. Free metadata requests allow us to only show Street View when available, avoiding poor user experiences in rural areas. Estimated cost: ~$35/month for 1,000 active users.
