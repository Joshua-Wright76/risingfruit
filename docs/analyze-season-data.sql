-- SQL queries to analyze existing season data in the database
-- Run these to understand what season information is already available

-- ============================================
-- 1. Overall Season Data Coverage
-- ============================================

-- How many locations have season data vs not?
SELECT
    COUNT(*) as total_locations,
    SUM(CASE WHEN season_start IS NOT NULL THEN 1 ELSE 0 END) as has_season_start,
    SUM(CASE WHEN season_stop IS NOT NULL THEN 1 ELSE 0 END) as has_season_stop,
    SUM(CASE WHEN season_start IS NOT NULL AND season_stop IS NOT NULL THEN 1 ELSE 0 END) as has_both,
    SUM(CASE WHEN no_season = 1 THEN 1 ELSE 0 END) as marked_no_season,
    SUM(CASE WHEN season_start IS NULL AND season_stop IS NULL AND no_season = 0 THEN 1 ELSE 0 END) as no_season_data,
    ROUND(100.0 * SUM(CASE WHEN season_start IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as pct_with_season
FROM locations
WHERE hidden = 0;

-- ============================================
-- 2. Most Common Season Ranges
-- ============================================

-- What are the most common season_start months?
SELECT
    season_start,
    COUNT(*) as count,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM locations WHERE season_start IS NOT NULL), 2) as percentage
FROM locations
WHERE season_start IS NOT NULL AND hidden = 0
GROUP BY season_start
ORDER BY count DESC
LIMIT 20;

-- What are the most common season_stop months?
SELECT
    season_stop,
    COUNT(*) as count,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM locations WHERE season_stop IS NOT NULL), 2) as percentage
FROM locations
WHERE season_stop IS NOT NULL AND hidden = 0
GROUP BY season_stop
ORDER BY count DESC
LIMIT 20;

-- Most common season ranges (start-stop combinations)
SELECT
    season_start || ' - ' || season_stop as season_range,
    COUNT(*) as count
FROM locations
WHERE season_start IS NOT NULL AND season_stop IS NOT NULL AND hidden = 0
GROUP BY season_start, season_stop
ORDER BY count DESC
LIMIT 30;

-- ============================================
-- 3. Season Data by Type
-- ============================================

-- For top 50 types, how many have season data?
WITH type_stats AS (
    SELECT
        t.id,
        t.en_name,
        t.scientific_name,
        COUNT(DISTINCT l.id) as location_count,
        SUM(CASE WHEN l.season_start IS NOT NULL THEN 1 ELSE 0 END) as with_season_start,
        SUM(CASE WHEN l.no_season = 1 THEN 1 ELSE 0 END) as marked_no_season
    FROM types t
    INNER JOIN location_types lt ON t.id = lt.type_id
    INNER JOIN locations l ON lt.location_id = l.id
    WHERE l.hidden = 0
    GROUP BY t.id
)
SELECT
    en_name,
    scientific_name,
    location_count,
    with_season_start,
    marked_no_season,
    ROUND(100.0 * with_season_start / location_count, 1) as pct_with_season,
    ROUND(100.0 * marked_no_season / location_count, 1) as pct_no_season
FROM type_stats
ORDER BY location_count DESC
LIMIT 50;

-- ============================================
-- 4. Geographic Distribution of Season Data
-- ============================================

-- Season data coverage by latitude band (rough climate zones)
SELECT
    CASE
        WHEN lat > 60 THEN '60+ Arctic'
        WHEN lat > 45 THEN '45-60 Cool Temperate'
        WHEN lat > 35 THEN '35-45 Warm Temperate'
        WHEN lat > 23.5 THEN '23.5-35 Subtropical'
        WHEN lat > -23.5 THEN '-23.5-23.5 Tropical'
        WHEN lat > -35 THEN '-35 to -23.5 Subtropical'
        WHEN lat > -45 THEN '-45 to -35 Warm Temperate'
        ELSE '< -45 Cool Temperate'
    END as latitude_band,
    COUNT(*) as total_locations,
    SUM(CASE WHEN season_start IS NOT NULL THEN 1 ELSE 0 END) as with_season,
    SUM(CASE WHEN no_season = 1 THEN 1 ELSE 0 END) as marked_no_season,
    ROUND(100.0 * SUM(CASE WHEN season_start IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1) as pct_with_season
FROM locations
WHERE hidden = 0
GROUP BY
    CASE
        WHEN lat > 60 THEN '60+ Arctic'
        WHEN lat > 45 THEN '45-60 Cool Temperate'
        WHEN lat > 35 THEN '35-45 Warm Temperate'
        WHEN lat > 23.5 THEN '23.5-35 Subtropical'
        WHEN lat > -23.5 THEN '-23.5-23.5 Tropical'
        WHEN lat > -35 THEN '-35 to -23.5 Subtropical'
        WHEN lat > -45 THEN '-45 to -35 Warm Temperate'
        ELSE '< -45 Cool Temperate'
    END
ORDER BY
    CASE
        WHEN lat > 60 THEN 1
        WHEN lat > 45 THEN 2
        WHEN lat > 35 THEN 3
        WHEN lat > 23.5 THEN 4
        WHEN lat > -23.5 THEN 5
        WHEN lat > -35 THEN 6
        WHEN lat > -45 THEN 7
        ELSE 8
    END;

-- ============================================
-- 5. Season Variation Within Same Type
-- ============================================

-- For popular types, show season variation across locations
-- Example: Apples (type_id = 114)
SELECT
    t.en_name,
    t.id as type_id,
    l.season_start || ' - ' || l.season_stop as season_range,
    COUNT(*) as location_count,
    ROUND(AVG(l.lat), 2) as avg_lat,
    ROUND(AVG(l.lng), 2) as avg_lng
FROM types t
INNER JOIN location_types lt ON t.id = lt.type_id
INNER JOIN locations l ON lt.location_id = l.id
WHERE
    t.en_name IN ('Apple', 'Orange', 'Lemon', 'Avocado', 'Fig', 'Blackberry', 'Peach', 'Plum')
    AND l.season_start IS NOT NULL
    AND l.hidden = 0
GROUP BY t.id, t.en_name, l.season_start, l.season_stop
ORDER BY t.en_name, location_count DESC;

-- ============================================
-- 6. Quality Issues / Outliers
-- ============================================

-- Find locations with unusual/suspicious season data
-- (e.g., season_start = season_stop, very short seasons, etc.)
SELECT
    l.id,
    l.lat,
    l.lng,
    l.season_start,
    l.season_stop,
    t.en_name,
    l.description,
    CASE
        WHEN l.season_start = l.season_stop THEN 'Same start/stop'
        WHEN l.season_start > l.season_stop AND l.season_start NOT IN ('October', 'November', 'December') THEN 'Inverted range (not winter wrap)'
        ELSE 'Other'
    END as issue_type
FROM locations l
INNER JOIN location_types lt ON l.id = lt.location_id
INNER JOIN types t ON lt.type_id = t.id
WHERE
    l.season_start IS NOT NULL
    AND l.season_stop IS NOT NULL
    AND l.hidden = 0
    AND (
        l.season_start = l.season_stop  -- Same month
        OR (l.season_start > l.season_stop AND l.season_start NOT IN ('October', 'November', 'December'))  -- Suspicious inversion
    )
LIMIT 100;

-- ============================================
-- 7. Locations Marked as "No Season" (Everbearing)
-- ============================================

-- Which types are most commonly marked as having no season?
SELECT
    t.en_name,
    t.scientific_name,
    COUNT(*) as no_season_count,
    (SELECT COUNT(*) FROM location_types lt2 WHERE lt2.type_id = t.id) as total_count,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM location_types lt2 WHERE lt2.type_id = t.id), 1) as pct_no_season
FROM locations l
INNER JOIN location_types lt ON l.id = lt.location_id
INNER JOIN types t ON lt.type_id = t.id
WHERE l.no_season = 1 AND l.hidden = 0
GROUP BY t.id
HAVING no_season_count > 5
ORDER BY pct_no_season DESC, no_season_count DESC
LIMIT 50;

-- ============================================
-- 8. Season Data Freshness
-- ============================================

-- When was season data last updated? (by year)
SELECT
    SUBSTR(updated_at, 1, 4) as update_year,
    COUNT(*) as location_count,
    SUM(CASE WHEN season_start IS NOT NULL THEN 1 ELSE 0 END) as with_season_data
FROM locations
WHERE
    updated_at IS NOT NULL
    AND season_start IS NOT NULL
    AND hidden = 0
GROUP BY SUBSTR(updated_at, 1, 4)
ORDER BY update_year DESC;

-- ============================================
-- 9. Specific Type Deep Dive
-- ============================================

-- Detailed season analysis for a specific type (e.g., Orange = type_id 3)
-- Shows geographic variation in seasons
SELECT
    l.id,
    l.lat,
    l.lng,
    l.season_start,
    l.season_stop,
    l.description,
    l.unverified,
    l.updated_at,
    CASE
        WHEN l.lat > 40 THEN 'Northern (40+)'
        WHEN l.lat > 35 THEN 'Mid-North (35-40)'
        WHEN l.lat > 30 THEN 'Mid (30-35)'
        WHEN l.lat > 25 THEN 'Mid-South (25-30)'
        ELSE 'Southern (<25)'
    END as lat_band
FROM locations l
INNER JOIN location_types lt ON l.id = lt.location_id
INNER JOIN types t ON lt.type_id = t.id
WHERE
    t.en_name = 'Orange'
    AND l.season_start IS NOT NULL
    AND l.hidden = 0
ORDER BY l.lat DESC;

-- ============================================
-- 10. Recommendations for Default Seasons
-- ============================================

-- For types without hardcoded seasons, what's the most common user-submitted range?
-- This can inform fallback season defaults
WITH season_modes AS (
    SELECT
        t.id as type_id,
        t.en_name,
        t.scientific_name,
        l.season_start,
        l.season_stop,
        COUNT(*) as occurrence_count,
        ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY COUNT(*) DESC) as rank
    FROM types t
    INNER JOIN location_types lt ON t.id = lt.type_id
    INNER JOIN locations l ON lt.location_id = l.id
    WHERE
        l.season_start IS NOT NULL
        AND l.season_stop IS NOT NULL
        AND l.hidden = 0
    GROUP BY t.id, l.season_start, l.season_stop
)
SELECT
    en_name,
    scientific_name,
    season_start || ' - ' || season_stop as most_common_season,
    occurrence_count,
    (SELECT COUNT(DISTINCT lt2.location_id)
     FROM location_types lt2
     INNER JOIN locations l2 ON lt2.location_id = l2.id
     WHERE lt2.type_id = type_id AND l2.hidden = 0) as total_locations
FROM season_modes
WHERE rank = 1 AND occurrence_count >= 10
ORDER BY total_locations DESC, occurrence_count DESC
LIMIT 100;
