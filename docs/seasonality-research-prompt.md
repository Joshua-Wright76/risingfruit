# Crop Seasonality Research: Deep Dive for 95% Reliability

## Objective
Design a location-aware, climate-sensitive fruit seasonality system that achieves **95% accuracy**: when a user sees a fruit marked as "in season", they should be able to find ripe fruit at that location at least 95% of the time.

## Core Research Questions

### 1. Climate Zone Methodology
**Question:** What is the optimal climate classification system for predicting fruit ripening seasons globally?

**Considerations:**
- USDA Plant Hardiness Zones (based on minimum winter temps)
- Koppen-Geiger Climate Classification (comprehensive climate types)
- AHS Heat Zones (maximum summer temps)
- Sunset Climate Zones (Western US detail)
- Custom hybrid approach combining multiple systems

**Desired Output:**
- Recommended classification system with justification
- Mapping from GPS coordinates → climate zone(s)
- How to handle micro-climates and elevation effects
- Edge cases: urban heat islands, coastal vs inland variations

### 2. Species-Level Variation
**Question:** How do we account for intra-species variation in fruiting times?

**Research Areas:**
- **Cultivar differences:** Early-season vs late-season varieties (e.g., Gravenstein apples in July vs Fuji in October)
- **Multi-crop species:** Figs (breba crop in June, main crop in August-October)
- **Everbearing varieties:** Strawberries, some citrus that fruit year-round in certain climates
- **Day-neutral vs photoperiod-sensitive:** How daylength affects flowering/fruiting

**Desired Output:**
- For each of the 4,000+ species in our database:
  - Typical early/peak/late harvest windows by climate zone
  - Known cultivar variations if identifiable from location descriptions
  - Probability distributions (e.g., "80% of apples ripen Sept-Nov, 15% Aug, 5% Dec in USDA Zone 7")

### 3. Geographic Variation Within Species
**Question:** How does the same species fruit at different times in different locations?

**Case Studies to Research:**
- **Oranges:** California (Dec-Mar) vs Florida (Oct-Jun) vs Mediterranean (Nov-Apr) vs Tropics (year-round)
- **Avocados:** California Hass (Feb-Sep) vs Florida varieties (Jun-Feb)
- **Blackberries:** Wild Pacific Northwest (Jun-Aug) vs Southern US (May-Jun) vs Hawaii (year-round)
- **Figs:** Mediterranean (Jul-Sep) vs California (Jun-Nov two crops) vs Southeast US (Jul-Oct)

**Desired Output:**
- Climate-zone-specific season mappings for top 100 most common foraging species
- Rules for extrapolating to less common species
- Handling tropical vs temperate vs Mediterranean climates
- Latitude correction factors (e.g., "add 1 week per 100 miles north")

### 4. Probabilistic Season Modeling
**Question:** How do we model the probabilistic nature of ripening seasons?

**Factors to Consider:**
- **Weather variation year-to-year:** Warm spring = early harvest, cool summer = late harvest
- **Growing degree days (GDD):** Thermal time accumulation models
- **Chill hours:** Winter cold requirement for stone fruits
- **Peak vs shoulders:** Define confidence intervals
  - High confidence (80%+ ripe): Peak season
  - Medium confidence (50-80%): Shoulder season
  - Low confidence (<50%): Off-season

**Desired Output:**
- Probability curves for each species × climate zone combination
- Model for "early season" (20-50% ripe), "peak season" (70-95% ripe), "late season" (30-60% ripe)
- How to handle user expectations: show only peak? show shoulders with lower confidence?

### 5. Data Sources & Ground Truth
**Question:** What are the most reliable data sources for validating our season predictions?

**Potential Sources:**
- **University Extension Services:** UC Davis Fruit & Nut Center, UF/IFAS, Cornell, etc.
- **USDA Agricultural Research:** Harvest calendars, phenology networks
- **iNaturalist observations:** Crowdsourced fruiting phenology data
- **Falling Fruit user submissions:** Location-specific season_start/season_stop fields
- **Scientific literature:** Horticultural journals, pomology texts
- **Commercial growers:** U-pick farm calendars, farmers market guides
- **Foraging guides:** Regional wildcrafting books, mushroom club calendars

**Desired Output:**
- Ranked list of data sources by reliability
- Methodology for combining conflicting sources
- How to weight scientific vs crowdsourced vs commercial data
- Validation approach: How do we test our predictions against ground truth?

### 6. User Experience & Confidence Levels
**Question:** How do we communicate season uncertainty to users?

**UX Considerations:**
- **Binary "in season" filter:** Shows only high-confidence (80%+) matches?
- **Three-tier system:** "Prime season" (80-95%), "Early/Late season" (50-80%), "Possible" (20-50%)?
- **Visual indicators:** Color coding, confidence percentages, date ranges?
- **Temporal precision:** Show as months? Specific date ranges? "Next 2 weeks" vs "this month"?

**Desired Output:**
- Recommended UX approach for displaying season info
- Minimum confidence threshold for "in season" filter (to achieve 95% reliability)
- How to handle edge cases: user traveling to different climate, unseasonable weather

### 7. Location-Specific Overrides
**Question:** How do we leverage location-specific season data from our database?

**Database Schema:**
- Locations table has `season_start` and `season_stop` fields (user-submitted)
- Some entries have `no_season` flag (e.g., tropical everbearing species)
- Quality varies: some accurate, some outdated, some user mistakes

**Research Approach:**
- **Trust hierarchy:** User-provided season > Species+Climate model > Global species default
- **Data cleaning:** Detect outliers (orange ripening in July in California = probably wrong)
- **Aggregation:** If 20 apple trees in Portland all say "September-November", high confidence
- **Freshness:** Weight recent submissions higher than 10-year-old data

**Desired Output:**
- Algorithm for combining user-submitted seasons with model predictions
- Outlier detection rules
- How to surface contradictions to users ("Database says Dec-Mar, but similar locations ripen Oct-Jan")

### 8. Climate Change Considerations
**Question:** How do we account for shifting seasons due to climate change?

**Trends to Research:**
- Earlier spring budbreak (1-2 weeks earlier than 1950s baseline)
- Extended growing seasons in temperate zones
- Heat stress affecting fruit quality in some regions
- New growing regions for traditionally tropical crops

**Desired Output:**
- Should we build in climate trend adjustments?
- Use recent data (last 5-10 years) vs historical averages?
- How to communicate changing seasons to users?

---

## Implementation Strategy Questions

### Phase 1: Minimum Viable Enhancement
What is the **minimum viable improvement** over the current hardcoded month ranges?

**Options:**
1. Add basic climate zone lookup (3 zones: Tropical, Temperate, Mediterranean)
2. Use location-specific season data when available, fall back to species defaults
3. Add ±2 week buffer to existing seasons to increase reliability
4. Crowdsource corrections from users ("Report incorrect season")

### Phase 2: Full Climate-Aware System
How do we build the complete climate-sensitive model?

**Components:**
1. GPS → Climate zone mapper (algorithm or lookup table?)
2. Species × Climate zone → Season probability curves (database table)
3. Location-specific overrides (use existing season_start/season_stop)
4. Confidence threshold filter (only show if >80% ripe probability)
5. User feedback loop (allow "Not ripe yet" / "Past season" reports)

### Phase 3: Machine Learning (Optional)
Could ML improve predictions beyond rule-based models?

**Potential Approaches:**
- Train on iNaturalist fruiting observations (labeled with GPS + date)
- Use Falling Fruit season data as training labels
- Ensemble model combining climate rules + learned patterns
- Predict "days until ripe" based on weather data APIs

---

## Deliverables from Research

### 1. Climate Zone Mapping System
- **Input:** Latitude, Longitude, Elevation (optional)
- **Output:** Climate zone ID (e.g., "Mediterranean-Coastal", "Temperate-Continental-7a")
- **Format:** JSON API, SQLite lookup table, or algorithm

### 2. Species × Climate Season Database
- **Schema:**
  ```json
  {
    "type_id": 3,  // Orange
    "climate_zone": "Mediterranean-Coastal",
    "season_peak_start": "December",
    "season_peak_end": "March",
    "season_shoulder_start": "November",
    "season_shoulder_end": "April",
    "confidence": 0.85,
    "sources": ["UC Davis", "USDA ARS"]
  }
  ```

### 3. Seasonality Algorithm Pseudocode
```python
def is_in_season(location_id, current_date, confidence_threshold=0.80):
    location = get_location(location_id)

    # Priority 1: Use location-specific season if validated
    if location.season_start and is_validated(location):
        return is_date_in_range(current_date, location.season_start, location.season_stop)

    # Priority 2: Use species + climate zone model
    climate_zone = get_climate_zone(location.lat, location.lng)
    for type_id in location.type_ids:
        season_data = get_season_probability(type_id, climate_zone, current_date)
        if season_data.confidence >= confidence_threshold:
            return True

    # Priority 3: Fall back to global species default (with warning)
    return fallback_season_check(location.type_ids, current_date)
```

### 4. Data Collection Plan
- Which university extension services to scrape/parse?
- How to query iNaturalist API for fruiting observations?
- Script to extract and validate season_start/season_stop from our database
- Crowdsourcing strategy for filling gaps

### 5. Validation Metrics
- How to measure the "95% reliability" target?
- Test set: Locations with known accurate seasons
- User feedback mechanism: "Was this fruit ripe?" button
- A/B test: Current simple model vs new climate-aware model

---

## Suggested Research Process

1. **Literature Review (Week 1)**
   - Read 10-20 papers on fruit phenology modeling
   - Survey university extension harvest calendars (5-10 regions)
   - Review iNaturalist and USA-NPN phenology datasets

2. **Data Analysis (Week 2)**
   - Analyze our existing season_start/season_stop data for patterns
   - Cluster locations by climate zone, compare season variations
   - Identify species with most geographic variation

3. **Prototype (Week 3)**
   - Build simple climate zone classifier (3-5 zones)
   - Create season lookup table for top 50 species × climate zones
   - Implement confidence scoring

4. **Validation (Week 4)**
   - Test against held-out location data
   - Calculate precision/recall for "in season" predictions
   - Iterate on confidence thresholds to hit 95% target

5. **Production Implementation (Week 5)**
   - Integrate into frontend season filter
   - Add UI for confidence levels
   - Deploy and monitor user feedback

---

## Key Questions for AI Researcher

Please provide comprehensive answers to these specific questions:

1. **Climate classification:** Which system gives best fruit season prediction accuracy? Provide comparison.

2. **Top 20 species variation:** For Apple, Orange, Lemon, Avocado, Fig, Blackberry, Peach, Plum, Cherry, Pear, Grape, Walnut, Pomegranate, Persimmon, Loquat, Mulberry, Olive, Guava, Mango, Papaya - provide season ranges for at least 5 climate zones each.

3. **Confidence modeling:** Statistical approach for "80% of fruit is ripe" - use GDD models, historical weather, or simpler heuristics?

4. **Data source quality:** Rank these sources for reliability: UC Extension, USDA, iNaturalist, user-submitted, foraging guides, commercial grower calendars.

5. **User feedback loop:** Best UX for collecting ground truth? ("Fruit was ripe" button, "Report wrong season", photo verification?)

6. **Phase 1 recommendation:** What's the single highest-impact change we can make to improve from current hardcoded seasons?

7. **Tropical vs temperate:** Fundamental differences in season modeling? Some tropical fruits have no season (everbearing) - how to handle?

8. **Edge cases:** How to handle:
   - Greenhouse/protected cultivation (year-round)
   - Stored fruit (apples in cold storage, ripe in spring)
   - Immature picking (green tomatoes, unripe figs for preserving)
   - Flowers vs fruit vs leaves (rose petals in May, hips in September)

---

## Success Criteria

The research is successful if it enables us to:

✅ **Achieve 95% reliability** - User finds ripe fruit when app says "in season"
✅ **Differentiate climates** - California orange ≠ Florida orange ≠ Mediterranean orange
✅ **Handle edge cases** - Tropical everbearing, multi-crop, cultivar variation
✅ **Scale to 4,000 species** - Model works for common and rare types
✅ **Use existing data** - Leverage our season_start/season_stop fields
✅ **Transparent confidence** - Users understand certainty levels
✅ **Maintainable** - Can update as climate zones shift, new cultivars appear

---

## Budget & Resources

- **Time:** 2-4 weeks for comprehensive research
- **Tools:** Access to academic papers (Sci-Hub, university library), API access to iNaturalist, USDA databases
- **Expertise:** Consult with pomologist, agricultural extension agent, or climate scientist?
- **Compute:** If using ML, GPU for training phenology models

---

## Notes & Open Questions

- Should we differentiate "edible but not peak flavor" vs "peak ripeness"? (e.g., early-season apples are edible but tart)
- How to handle foraged greens (kale, dandelion) where "season" = "when leaves are tender" not "when fruiting"?
- Some herbs are best BEFORE flowering (rosemary, basil) - season = inverse of bloom time
- Nuts drop at maturity but may need drying - show "in season" during drop or after drying?
- Frozen fruit (mulberries, cherries) - fine for cooking but not fresh eating - how to communicate?

---

**Final Question for Research:**
Given the constraints of our existing database schema, available data sources, and the goal of 95% reliability - what is the **optimal balance between accuracy and implementation complexity** for a production system serving 2M+ locations?
