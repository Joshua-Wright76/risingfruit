# Rising Fruit - Product Requirements Document

**Version:** 1.0  
**Last Updated:** December 31, 2024  
**Status:** Phase 1 Complete, Phase 2 Planning

---

## Executive Summary

Rising Fruit is a mobile-first Progressive Web App (PWA) that provides a modern, intuitive interface for discovering and sharing urban foraging locations. It serves as an alternative client for the [Falling Fruit](https://fallingfruit.org/) open-source foraging database, which contains nearly 2 million locations worldwide.

### Vision Statement
*"Make urban foraging accessible, delightful, and community-driven by providing the best mobile experience for discovering free food in your neighborhood."*

### Target Users
1. **Urban Foragers** - People who actively harvest fruit, nuts, and herbs from public spaces
2. **Casual Explorers** - People curious about what's growing around them
3. **Community Gardeners** - Those maintaining public fruit trees who want to share
4. **Food Security Advocates** - Organizations mapping food resources in communities

---

## Product Goals & Success Metrics

### Primary Goals

| Goal | Metric | Target |
|------|--------|--------|
| **Discoverability** | Time to find first location | < 10 seconds |
| **Mobile Experience** | Lighthouse PWA score | > 90 |
| **Engagement** | Return visits (7-day) | > 40% |
| **Performance** | Map load time | < 3 seconds |
| **Accessibility** | WCAG compliance | AA level |

### Secondary Goals

| Goal | Metric | Target |
|------|--------|--------|
| **Offline Capability** | Features available offline | Core browsing |
| **Geographic Coverage** | Locations with custom icons | Top 50 fruit types |
| **Community Growth** | New contributions/month | +5% MoM |

---

## Feature Requirements

### Phase 1: Core Experience ✅ COMPLETE

#### 1.1 Interactive Map
| Requirement | Status | Notes |
|-------------|--------|-------|
| Full-screen Mapbox GL map | ✅ | Dark theme default |
| Location markers with clustering | ✅ | Supercluster implementation |
| Custom fruit icons (44 types) | ✅ | SVG data URIs |
| Season indicators (green/gray borders) | ✅ | Based on current month |
| Geolocation button | ✅ | Bottom-right position |
| Smooth pan/zoom interactions | ✅ | 60fps target |

#### 1.2 Location Details
| Requirement | Status | Notes |
|-------------|--------|-------|
| Bottom sheet on marker tap | ✅ | React Portal implementation |
| Display: name, description, access | ✅ | Full location metadata |
| Display: season information | ✅ | With fallback seasons |
| "Get Directions" button | ✅ | Apple Maps / Google Maps |
| Share button | ✅ | Web Share API + clipboard |
| Close via tap/swipe/Escape | ✅ | Multiple dismissal methods |

#### 1.3 Search & Filtering
| Requirement | Status | Notes |
|-------------|--------|-------|
| Type search with autocomplete | ✅ | Debounced, min 2 chars |
| Category filters (4 types) | ✅ | Forager, Honeybee, Grafter, Freegan |
| "In Season" toggle | ✅ | Based on current month |
| Clear all filters | ✅ | Single action reset |
| Filter indicator badge | ✅ | Shows active filter count |

#### 1.4 PWA Features
| Requirement | Status | Notes |
|-------------|--------|-------|
| Installable on iOS/Android | ✅ | Web manifest configured |
| Service worker caching | ✅ | Map tiles, API responses |
| Offline map tile viewing | ✅ | Cache-first strategy |
| App icons (192, 512) | ✅ | PNG format |

---

### Phase 2: Enhanced Experience 🔜 PLANNED

#### 2.1 User Accounts
| Requirement | Priority | Status |
|-------------|----------|--------|
| Email/password registration | P1 | 🔲 Not started |
| Social login (Google, Apple) | P2 | 🔲 Not started |
| Profile page | P1 | 🔲 Not started |
| Contribution history | P2 | 🔲 Not started |

#### 2.2 Location Contributions
| Requirement | Priority | Status |
|-------------|----------|--------|
| Add new location | P1 | 🔲 Not started |
| Edit existing location | P1 | 🔲 Not started |
| Photo upload | P1 | 🔲 Not started |
| Location verification | P2 | 🔲 Not started |
| Report inaccurate location | P2 | 🔲 Not started |

#### 2.3 Social Features
| Requirement | Priority | Status |
|-------------|----------|--------|
| Location reviews/comments | P2 | 🔲 Not started |
| Favorite locations | P2 | 🔲 Not started |
| Share to social media | P2 | 🔲 Not started |
| Activity feed | P3 | 🔲 Not started |

#### 2.4 Advanced Features
| Requirement | Priority | Status |
|-------------|----------|--------|
| Push notifications (season alerts) | P2 | 🔲 Not started |
| Route planning (multi-stop) | P3 | 🔲 Not started |
| Offline location caching | P2 | 🔲 Not started |
| Harvest tracking | P3 | 🔲 Not started |

---

### Phase 3: Growth & Scale 📋 FUTURE

#### 3.1 Platform Expansion
- Native app wrappers (Capacitor)
- Apple App Store / Google Play distribution
- Apple Watch companion app

#### 3.2 Community Features
- User reputation system
- Badges and achievements
- Community challenges
- Local foraging groups

#### 3.3 Advanced Intelligence
- ML-based location verification
- Photo recognition for plant ID
- Yield prediction based on weather
- AR mode for navigation

---

## Technical Requirements

### Performance

| Metric | Requirement | Current |
|--------|-------------|---------|
| First Contentful Paint | < 1.5s | ~1.2s |
| Largest Contentful Paint | < 2.5s | ~2.0s |
| Time to Interactive | < 3.0s | ~2.5s |
| Cumulative Layout Shift | < 0.1 | < 0.05 |
| Map tile load (cached) | < 500ms | ~300ms |

### Scalability

| Metric | Requirement |
|--------|-------------|
| Concurrent users | 10,000+ |
| Locations in viewport | 5,000+ with clustering |
| API response time (p95) | < 500ms |
| Database queries | O(log n) via R-tree |

### Compatibility

| Platform | Requirement |
|----------|-------------|
| iOS Safari | 15+ |
| Chrome Mobile | 90+ |
| Chrome Desktop | 90+ |
| Firefox | 90+ |
| Edge | 90+ |

### Security

| Requirement | Implementation |
|-------------|----------------|
| HTTPS only | Enforced |
| API authentication | Token-based (Phase 2) |
| Input sanitization | Server-side validation |
| XSS prevention | React auto-escaping |
| CSRF protection | SameSite cookies |

---

## User Experience Requirements

### Mobile-First Design
- Touch targets minimum 44x44px
- Swipe gestures for navigation
- Bottom sheet for details (thumb-friendly)
- Single-hand operation support

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- High contrast mode support
- Keyboard navigation
- Reduced motion option

### Internationalization (Future)
- Support for 17 languages (matching Falling Fruit)
- RTL language support
- Localized plant names

---

## Data Requirements

### Location Data
```typescript
interface Location {
  id: number;
  lat: number;
  lng: number;
  description: string | null;
  access: string | null;
  season_start: string | null;
  season_stop: string | null;
  no_season: boolean;
  type_ids: number[];
  unverified: boolean;
  author: string | null;
  created_at: string;
  updated_at: string;
}
```

### Type Data
```typescript
interface PlantType {
  id: number;
  en_name: string;
  scientific_name: string | null;
  category_mask: string;
  parent_id: number | null;
  wikipedia_url: string | null;
  localized_names: Record<string, string>;
}
```

### Data Sources
- **Primary:** Falling Fruit CSV exports (nightly sync)
- **Volume:** ~2M locations, ~4K plant types
- **Update frequency:** Daily automated sync

---

## Dependencies

### External Services
| Service | Purpose | Criticality |
|---------|---------|-------------|
| Falling Fruit | Data source | Critical |
| Mapbox | Map tiles & geocoding | Critical |
| AWS EC2 | Backend hosting | Critical |
| GitHub Actions | CI/CD | High |
| Cloudflare | CDN (future) | Medium |

### Third-Party Libraries (Key)
| Library | Purpose | Version |
|---------|---------|---------|
| React | UI framework | 18.x |
| Mapbox GL JS | Map rendering | 3.x |
| TanStack Query | Data fetching | 5.x |
| Tailwind CSS | Styling | 3.x |
| Playwright | E2E testing | 1.x |

---

## Constraints & Assumptions

### Constraints
1. **Data licensing:** Must comply with Falling Fruit open data terms
2. **Mapbox quotas:** Free tier limits (50K loads/month)
3. **No backend modifications:** Read-only access to Falling Fruit data
4. **Budget:** Minimal hosting costs (t2.micro EC2)

### Assumptions
1. Users have modern mobile browsers (ES2020+)
2. Users are comfortable with map interfaces
3. Location data accuracy is validated by community
4. Internet connectivity available for initial load

---

## Success Criteria

### Phase 1 (Current)
- [x] Map loads within 3 seconds
- [x] Users can find locations in their area
- [x] App is installable as PWA
- [x] All E2E tests passing
- [x] Deployed to production

### Phase 2 (Target: Q2 2025)
- [ ] User registration/login working
- [ ] Users can add new locations
- [ ] Photo upload functional
- [ ] 500+ daily active users

### Phase 3 (Target: Q4 2025)
- [ ] Native apps in app stores
- [ ] Push notifications enabled
- [ ] 5,000+ monthly active users
- [ ] Community moderation system

---

## Appendix

### Competitive Analysis
| Feature | Rising Fruit | Falling Fruit | iNaturalist |
|---------|--------------|---------------|-------------|
| Mobile PWA | ✅ | ❌ | ✅ |
| Custom fruit icons | ✅ | ❌ | ❌ |
| Season indicators | ✅ | Partial | ❌ |
| Offline support | ✅ | ❌ | ✅ |
| Dark mode | ✅ | ❌ | ✅ |
| Contribution | Phase 2 | ✅ | ✅ |

### Reference Links
- [Falling Fruit](https://fallingfruit.org/)
- [Mapbox Documentation](https://docs.mapbox.com/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

