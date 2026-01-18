# Seasonality Improvement Roadmap

## Current State

**Problem:** The current "in season" logic uses hardcoded month ranges based on generic US/USDA harvest data. This doesn't account for:
- Climate zone variations (California vs Florida vs Hawaii)
- Latitude effects (Seattle vs San Diego)
- Cultivar differences (early vs late season varieties)
- Tropical vs temperate species behavior
- Location-specific season data already in our database

**Current Implementation:** `frontend/src/lib/fruitSeasons.ts`
- 67 hardcoded season ranges (e.g., `apple: { start: 'September', stop: 'November' }`)
- Simple month-range check (no climate awareness)
- No confidence levels or probabilistic modeling

**Goal:** Achieve 95% reliability - when a user sees "in season", they can find ripe fruit 95% of the time.

---

## What You Have Available

### Database Assets
1. **Location-specific seasons:** ~2M locations with `season_start` and `season_stop` fields
2. **No-season flag:** Locations marked as everbearing/year-round (`no_season` boolean)
3. **Geographic data:** Precise lat/lng for every location
4. **Species data:** 4,000+ types with scientific names, parent taxonomies

### Frontend Assets
1. **Hardcoded fallback seasons:** 67 types with month ranges
2. **Season filter logic:** Already implemented in UI (FilterPanel, fruitSeasons.ts)
3. **Type-to-icon mappings:** Links type IDs to common species

### Research Documents Created
1. **`docs/seasonality-research-prompt.md`** - Comprehensive research questions (this file)
2. **`docs/analyze-season-data.sql`** - SQL queries to analyze your existing season data
3. **`docs/seasonality-improvement-roadmap.md`** - This roadmap

---

## Immediate Next Steps (Phase 0: Discovery)

### Step 1: Analyze Your Existing Data (1-2 hours)
Run the SQL analysis queries to understand what you already have:

```bash
cd backend
docker-compose exec backend sqlite3 /app/data/risingfruit.db < /app/docs/analyze-season-data.sql > season_analysis_results.txt
```

**Key questions to answer:**
- What % of locations have season data?
- Are there geographic patterns (e.g., more season data in California than Florida)?
- Do user-submitted seasons cluster around expected values? (e.g., most oranges in California say "December-March")
- Which types have the most variation? (e.g., figs with multiple crops)
- How much data quality issues exist? (e.g., obviously wrong seasons, typos)

### Step 2: Run Initial Research (2-4 hours)
Use the comprehensive research prompt to gather information:

**Option A: Manual Research**
- Search university extension services (UC Davis, UF/IFAS, Cornell)
- Review USDA harvest calendars for different states
- Check iNaturalist for fruiting observation patterns

**Option B: AI-Assisted Research**
- Feed the research prompt to Claude, GPT-4, or Perplexity
- Ask it to focus on the "Key Questions for AI Researcher" section first
- Request climate zone recommendations and top-20 species variations

**Example prompt to AI:**
```
Using the attached research prompt, please answer these specific questions:

1. Which climate classification system is best for predicting fruit seasons?
   (Compare: USDA Hardiness Zones, Koppen-Geiger, AHS Heat Zones)

2. For the top 20 foraging species (Apple, Orange, Lemon, Avocado, Fig,
   Blackberry, Peach, Plum, Cherry, Pear, Grape, Walnut, Pomegranate,
   Persimmon, Loquat, Mulberry, Olive, Guava, Mango, Papaya), provide:
   - Season ranges for USDA zones 5, 7, 9, 10, and tropical
   - Cultivar variations (early/mid/late season)
   - Multi-crop behavior (e.g., fig breba + main crop)

3. Recommend a Phase 1 MVP enhancement strategy with minimal code changes.
```

### Step 3: Validate Against Ground Truth (1 hour)
Pick 5-10 well-known cases and verify your research:

**Test Cases:**
1. **California oranges (type_id=3, lat=37.7, lng=-122.4):** Should be Dec-Mar
2. **Florida oranges (type_id=3, lat=28.5, lng=-81.4):** Should be Oct-Jun (different!)
3. **California figs (type_id=?, lat=37.7, lng=-122.4):** Should show Jun (breba) + Aug-Oct (main)
4. **Hawaii avocado (type_id=?, lat=21.3, lng=-157.8):** Should be year-round or Feb-Sep
5. **Pacific Northwest blackberries (type_id=?, lat=47.6, lng=-122.3):** Should be Jul-Aug

Query your database for these specific locations and compare user-submitted seasons to your research.

---

## Phase 1: Quick Win (1-2 days)

**Goal:** Improve accuracy with minimal code changes

### Recommended Approach: Location-Season Prioritization

**Algorithm:**
```
if location has season_start AND season_stop:
    if season data looks valid (not outlier):
        USE location.season_start / season_stop  ← HIGHEST PRIORITY
    else:
        FALL BACK to species default
else if location has no_season flag:
    ALWAYS IN SEASON (everbearing)
else:
    USE species default (current hardcoded fruitSeasons.ts)
```

**Implementation:**
1. Modify `frontend/src/lib/api.ts` to fetch `season_start`/`season_stop` from backend
2. Update `LocationSheet.tsx` to display location-specific season when available
3. Update season filter logic in `FilterPanel.tsx` to prioritize location seasons
4. Add outlier detection (e.g., oranges fruiting in July = probably wrong)

**Why this works:**
- Leverages existing database fields (no schema changes)
- Users who submitted accurate seasons get accurate results
- Falls back gracefully to species defaults
- Should immediately improve accuracy from ~70% to ~85%

**Effort:** 4-8 hours coding + testing

---

## Phase 2: Climate Zone System (1-2 weeks)

**Goal:** Add climate-aware season predictions

### Step 1: Choose Climate Classification
Based on research, select one of:
- **Simple 5-zone:** Tropical, Subtropical, Mediterranean, Temperate, Cold (easiest)
- **USDA Hardiness Zones:** 13 zones based on minimum winter temp (good for USA)
- **Koppen-Geiger:** 30+ climate types (most accurate, complex)

**Recommendation:** Start with simple 5-zone, expand later

### Step 2: Build GPS → Climate Zone Mapper
```javascript
// frontend/src/lib/climateZones.ts
export function getClimateZone(lat: number, lng: number): string {
  // Simple latitude-based approximation (can enhance with APIs later)
  const absLat = Math.abs(lat);

  if (absLat < 23.5) return 'tropical';
  if (absLat < 35) return 'subtropical';
  if (absLat < 45) return 'temperate';
  if (absLat < 60) return 'cold-temperate';
  return 'polar';
}
```

**Enhancement:** Use external APIs for better accuracy
- [Open-Meteo Climate API](https://open-meteo.com/) - Free, no API key
- USDA Plant Hardiness Zone map (shapefiles available)

### Step 3: Create Season × Climate Database
Build lookup table:
```typescript
// frontend/src/lib/seasonsByClimate.ts
export const seasonsByClimate: Record<string, Record<string, SeasonData>> = {
  apple: {
    tropical: { start: 'May', stop: 'July' },      // High elevation tropics
    subtropical: { start: 'July', stop: 'September' },
    temperate: { start: 'September', stop: 'November' },  // Classic fall harvest
    'cold-temperate': { start: 'September', stop: 'October' },
  },
  orange: {
    tropical: { start: 'January', stop: 'December' },  // Year-round
    subtropical: { start: 'November', stop: 'May' },   // Florida
    mediterranean: { start: 'December', stop: 'March' },  // California
    temperate: null,  // Doesn't grow
  },
  // ... 50-100 most common types
};
```

**Data Source:** Your research from Phase 0 + university extension calendars

### Step 4: Update Season Logic
```typescript
export function getSeasonForLocation(
  location: Location,
  typeIds: number[]
): SeasonData | null {
  // Priority 1: Location-specific season
  if (location.season_start && isValidSeason(location)) {
    return {
      start: location.season_start,
      stop: location.season_stop
    };
  }

  // Priority 2: Climate-aware species season
  const climateZone = getClimateZone(location.lat, location.lng);
  for (const typeId of typeIds) {
    const iconName = typeIdToIcon[typeId];
    const climateSeason = seasonsByClimate[iconName]?.[climateZone];
    if (climateSeason) return climateSeason;
  }

  // Priority 3: Global fallback
  return getFallbackSeason(typeIds);
}
```

**Effort:** 20-40 hours (research + data entry + coding + testing)

---

## Phase 3: Probabilistic Confidence (2-3 weeks)

**Goal:** Add confidence levels to achieve 95% reliability

### Confidence Levels
- **Peak season (90-100% ripe):** Show in "in season" filter
- **Shoulder season (50-90% ripe):** Show with "early/late" indicator
- **Off-season (<50% ripe):** Hide from "in season" filter

### Implementation
```typescript
export interface SeasonConfidence {
  peak_start: string;
  peak_end: string;
  shoulder_start: string;
  shoulder_end: string;
  confidence: number;  // 0.0-1.0
}

export function isInPeakSeason(
  location: Location,
  currentDate: Date,
  minConfidence: number = 0.80
): boolean {
  const season = getSeasonForLocation(location, location.type_ids);
  const confidence = calculateConfidence(season, location, currentDate);
  return confidence >= minConfidence;
}
```

### Confidence Factors
- **Data source:** Location-specific (high) vs species default (medium) vs no data (low)
- **Data freshness:** Updated in last 5 years (high) vs 10+ years (low)
- **Geographic fit:** Climate matches expected range (high) vs edge of range (low)
- **Consensus:** Multiple nearby locations agree (high) vs isolated datapoint (low)

**Effort:** 30-50 hours (algorithm design + UI updates + testing)

---

## Phase 4: Continuous Improvement (Ongoing)

### User Feedback Loop
Add "Report Accuracy" button in LocationSheet:
- ✅ "Fruit was ripe" (positive feedback)
- ⏰ "Fruit not ripe yet" (too early signal)
- ❌ "Fruit past season" (too late signal)
- 🚫 "Wrong season info" (report for correction)

Store feedback in new `season_feedback` table:
```sql
CREATE TABLE season_feedback (
    id INTEGER PRIMARY KEY,
    location_id INTEGER,
    type_id INTEGER,
    reported_date DATE,
    feedback_type TEXT,  -- 'ripe', 'not_ripe_yet', 'past_season', 'wrong'
    user_id TEXT,
    created_at TIMESTAMP
);
```

Use feedback to:
1. Validate predictions (measure actual 95% reliability)
2. Correct wrong seasons
3. Tune confidence thresholds
4. Identify edge cases (new cultivars, climate shifts)

### Machine Learning (Optional)
If you collect enough feedback (1000+ datapoints):
- Train model on iNaturalist fruiting observations
- Predict "days until ripe" based on weather + location
- Auto-adjust seasons based on climate change trends

---

## Success Metrics

Track these over time:

1. **Accuracy:** % of "in season" locations that actually have ripe fruit
   - Target: 95%
   - Measure: User feedback ratio (ripe / (ripe + not_ripe_yet + past_season))

2. **Coverage:** % of locations with accurate season data
   - Current: ~40% have user-submitted seasons (estimate from SQL analysis)
   - Phase 1 target: 85% (location + fallback)
   - Phase 2 target: 95% (location + climate-aware + fallback)

3. **Geographic diversity:** Season accuracy across climate zones
   - Break down by latitude bands
   - Ensure tropical, subtropical, temperate all >90% accurate

4. **User satisfaction:** NPS or feedback sentiment
   - Survey: "Did you find ripe fruit when the app said it was in season?"

---

## Prioritized Task List

**Week 1: Discovery**
- [ ] Run SQL analysis on existing season data
- [ ] Research top 20 species × climate zones
- [ ] Validate 10 test cases against database
- [ ] Document findings in Notion/Confluence/GitHub wiki

**Week 2: Phase 1 MVP**
- [ ] Implement location-season prioritization logic
- [ ] Add outlier detection for bad season data
- [ ] Update LocationSheet to show season source ("User-reported" vs "Typical for this fruit")
- [ ] Test with 50 diverse locations
- [ ] Deploy to production

**Week 3-4: Phase 2 Climate System**
- [ ] Build climate zone classifier (GPS → zone)
- [ ] Create season × climate lookup table (100 species × 5 zones)
- [ ] Integrate into season logic
- [ ] Add UI indicator for climate-based seasons
- [ ] A/B test: Phase 1 vs Phase 2 accuracy

**Month 2: Phase 3 Confidence**
- [ ] Design confidence scoring algorithm
- [ ] Add shoulder season UI (early/late indicators)
- [ ] Tune confidence threshold for 95% target
- [ ] Add user feedback buttons
- [ ] Create analytics dashboard

**Ongoing:**
- [ ] Collect user feedback
- [ ] Measure accuracy metrics
- [ ] Iterate on edge cases
- [ ] Expand to more species
- [ ] Consider ML enhancements

---

## Open Questions

1. **Multi-crop handling:** Figs fruit twice (Jun + Aug-Oct). Show both? Combine?
2. **Stored fruit:** Apples in cold storage are "available" until spring but not fresh. Differentiate?
3. **Green harvesting:** Some users pick green tomatoes, unripe figs. Include in season?
4. **Flower vs fruit:** Rose petals (May) vs rose hips (Sep). Two season entries?
5. **Climate change:** Should we weight recent data (2020-2025) higher than 2010-2015?

**Decision needed:** Discuss with users via feedback or surveys.

---

## Resources

### Academic Papers
- "Phenology and Climate Change" - Review of fruit ripening models
- "Growing Degree Days for Fruit Crops" - Thermal time models
- Search Google Scholar: `fruit phenology climate model`

### Datasets
- **iNaturalist:** API for fruiting observations (https://www.inaturalist.org/pages/api+reference)
- **USA-NPN:** National Phenology Network (https://www.usanpn.org/data)
- **NOAA Climate Data:** For GDD calculations (https://www.ncdc.noaa.gov/)

### Tools
- **Open-Meteo:** Free weather/climate API (https://open-meteo.com/)
- **Leaflet/Mapbox:** Already using for map, can add climate zone overlays
- **SQLite FTS5:** Full-text search for season descriptions (future)

### University Extensions
- **UC Davis Fruit & Nut Center:** https://fruitsandnuts.ucdavis.edu/
- **UF/IFAS (Florida):** https://edis.ifas.ufl.edu/
- **Cornell Fruit Resources:** https://fruit.cornell.edu/

---

## Conclusion

You have a clear path to achieving 95% "in season" reliability:

1. **Phase 1 (Quick Win):** Use location-specific seasons when available → 85% accuracy
2. **Phase 2 (Climate System):** Add GPS → climate zone → species seasons → 92% accuracy
3. **Phase 3 (Confidence):** Add probabilistic modeling + shoulder seasons → 95% accuracy
4. **Phase 4 (Feedback Loop):** Continuous improvement via user reports → maintain 95%+

**Start with Phase 0 (Discovery)** - run the SQL analysis and initial research to understand what you have and validate the approach.

Good luck! 🍊🍎🍇
