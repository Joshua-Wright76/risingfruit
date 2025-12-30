-- Rising Fruit Database Schema
-- SQLite with R-tree spatial indexing for Falling Fruit data

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================
-- Types table - Plant/food type definitions
-- ============================================
CREATE TABLE IF NOT EXISTS types (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER REFERENCES types(id),
    scientific_name TEXT,
    scientific_synonyms TEXT,
    taxonomic_rank TEXT,
    en_name TEXT,
    en_synonyms TEXT,
    wikipedia_url TEXT,
    category_mask TEXT,
    pending INTEGER DEFAULT 0,
    -- Localized names stored as JSON for flexibility
    localized_names TEXT  -- JSON: {"ar": "...", "de": "...", ...}
);

-- Indexes for types
CREATE INDEX IF NOT EXISTS idx_types_parent_id ON types(parent_id);
CREATE INDEX IF NOT EXISTS idx_types_category_mask ON types(category_mask);
CREATE INDEX IF NOT EXISTS idx_types_en_name ON types(en_name);

-- ============================================
-- Locations table - Foraging locations
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    unverified INTEGER DEFAULT 0,
    description TEXT,
    season_start TEXT,
    season_stop TEXT,
    no_season INTEGER DEFAULT 0,
    author TEXT,
    address TEXT,
    access TEXT,
    import_link TEXT,
    original_ids TEXT,
    hidden INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
);

-- Indexes for locations
CREATE INDEX IF NOT EXISTS idx_locations_hidden ON locations(hidden);
CREATE INDEX IF NOT EXISTS idx_locations_unverified ON locations(unverified);
CREATE INDEX IF NOT EXISTS idx_locations_author ON locations(author);

-- ============================================
-- Location-Types junction table (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS location_types (
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    type_id INTEGER NOT NULL REFERENCES types(id) ON DELETE CASCADE,
    PRIMARY KEY (location_id, type_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_location_types_type_id ON location_types(type_id);
CREATE INDEX IF NOT EXISTS idx_location_types_location_id ON location_types(location_id);

-- ============================================
-- R-tree spatial index for fast bounding box queries
-- ============================================
CREATE VIRTUAL TABLE IF NOT EXISTS locations_rtree USING rtree(
    id,              -- Integer primary key
    min_lat, max_lat, -- Latitude bounds (for point: min=max)
    min_lng, max_lng  -- Longitude bounds (for point: min=max)
);

-- ============================================
-- Views for common queries
-- ============================================

-- View: Locations with their type names (first type only for simplicity)
CREATE VIEW IF NOT EXISTS v_locations_with_types AS
SELECT 
    l.id,
    l.lat,
    l.lng,
    l.description,
    l.season_start,
    l.season_stop,
    l.access,
    l.author,
    l.created_at,
    l.updated_at,
    GROUP_CONCAT(t.en_name, ', ') AS type_names,
    GROUP_CONCAT(lt.type_id) AS type_ids
FROM locations l
LEFT JOIN location_types lt ON l.id = lt.location_id
LEFT JOIN types t ON lt.type_id = t.id
WHERE l.hidden = 0
GROUP BY l.id;

-- View: Type hierarchy with parent names
CREATE VIEW IF NOT EXISTS v_types_with_parent AS
SELECT 
    t.id,
    t.en_name,
    t.scientific_name,
    t.taxonomic_rank,
    t.category_mask,
    t.wikipedia_url,
    t.parent_id,
    p.en_name AS parent_name,
    t.localized_names
FROM types t
LEFT JOIN types p ON t.parent_id = p.id
WHERE t.pending = 0;

-- ============================================
-- Triggers to keep R-tree in sync
-- ============================================

-- Insert trigger: Add to R-tree when location is inserted
CREATE TRIGGER IF NOT EXISTS tr_locations_insert
AFTER INSERT ON locations
BEGIN
    INSERT INTO locations_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (NEW.id, NEW.lat, NEW.lat, NEW.lng, NEW.lng);
END;

-- Update trigger: Update R-tree when location coordinates change
CREATE TRIGGER IF NOT EXISTS tr_locations_update
AFTER UPDATE OF lat, lng ON locations
BEGIN
    UPDATE locations_rtree 
    SET min_lat = NEW.lat, max_lat = NEW.lat,
        min_lng = NEW.lng, max_lng = NEW.lng
    WHERE id = NEW.id;
END;

-- Delete trigger: Remove from R-tree when location is deleted
CREATE TRIGGER IF NOT EXISTS tr_locations_delete
AFTER DELETE ON locations
BEGIN
    DELETE FROM locations_rtree WHERE id = OLD.id;
END;

