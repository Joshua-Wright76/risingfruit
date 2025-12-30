#!/usr/bin/env python3
"""
Import Falling Fruit CSV data into SQLite database.

Memory-optimized version that imports in small chunks.

Usage:
    python import.py [--data-dir /path/to/data] [--db-path /path/to/db.sqlite]
"""

import argparse
import csv
import json
import os
import sqlite3
import sys
from pathlib import Path

# Increase CSV field size limit for large description fields
csv.field_size_limit(sys.maxsize)

# Default paths
DEFAULT_DATA_DIR = Path(__file__).parent.parent / "data"
DEFAULT_DB_PATH = Path(__file__).parent.parent / "data" / "risingfruit.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"

# Localized name columns in types.csv
LOCALIZED_COLUMNS = [
    "ar_name", "de_name", "el_name", "es_name", "fr_name", "he_name",
    "it_name", "nl_name", "pl_name", "pt_name", "sk_name", "sv_name",
    "tr_name", "uk_name", "vi_name", "zh_hans_name", "zh_hant_name"
]

# Batch size for memory-efficient processing
BATCH_SIZE = 5000  # Smaller batches for lower memory usage


def log(msg: str) -> None:
    """Print log message with prefix."""
    print(f"[IMPORT] {msg}", flush=True)


def create_database(db_path: Path) -> sqlite3.Connection:
    """Create database and apply schema."""
    log(f"Creating database at {db_path}")
    
    # Remove existing database
    if db_path.exists():
        log("Removing existing database...")
        db_path.unlink()
    
    # Create parent directory if needed
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Connect and apply schema
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=-32000")  # 32MB cache (reduced from 64MB)
    conn.execute("PRAGMA temp_store=FILE")  # Use file for temp storage instead of RAM
    
    log("Applying schema...")
    with open(SCHEMA_PATH, "r") as f:
        schema = f.read()
    conn.executescript(schema)
    conn.commit()
    
    return conn


def parse_bool(value: str) -> int:
    """Parse boolean string to integer (0/1)."""
    if not value:
        return 0
    return 1 if value.lower() in ("true", "1", "yes", "t") else 0


def import_types(conn: sqlite3.Connection, data_dir: Path) -> int:
    """Import types.csv into database."""
    types_file = data_dir / "types.csv"
    if not types_file.exists():
        log(f"ERROR: {types_file} not found")
        return 0
    
    log(f"Importing types from {types_file}...")
    
    # Disable foreign keys during import (parent_id may reference not-yet-imported types)
    conn.execute("PRAGMA foreign_keys = OFF")
    
    cursor = conn.cursor()
    count = 0
    
    with open(types_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # Build localized names JSON
            localized = {}
            for col in LOCALIZED_COLUMNS:
                if row.get(col):
                    # Extract language code (e.g., "ar" from "ar_name")
                    lang = col.replace("_name", "")
                    localized[lang] = row[col]
            
            cursor.execute("""
                INSERT INTO types (
                    id, parent_id, scientific_name, scientific_synonyms,
                    taxonomic_rank, en_name, en_synonyms, wikipedia_url,
                    category_mask, pending, localized_names
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                int(row["id"]),
                int(row["parent_id"]) if row.get("parent_id") else None,
                row.get("scientific_name") or None,
                row.get("scientific_synonyms") or None,
                row.get("taxonomic_rank") or None,
                row.get("en_name") or None,
                row.get("en_synonyms") or None,
                row.get("en_wikipedia_url") or None,
                row.get("category_mask") or None,
                parse_bool(row.get("pending", "")),
                json.dumps(localized) if localized else None
            ))
            count += 1
            
            if count % 1000 == 0:
                conn.commit()  # Commit every 1000 rows
                log(f"  Imported {count} types...")
    
    conn.commit()
    
    # Re-enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON")
    
    log(f"  Imported {count} types total")
    return count


def import_locations(conn: sqlite3.Connection, data_dir: Path) -> int:
    """Import locations.csv into database with memory-efficient chunked processing."""
    locations_file = data_dir / "locations.csv"
    if not locations_file.exists():
        log(f"ERROR: {locations_file} not found")
        return 0
    
    log(f"Importing locations from {locations_file}...")
    log(f"  Using batch size of {BATCH_SIZE} for memory efficiency")
    
    # Disable triggers and foreign keys during bulk import for performance
    conn.execute("PRAGMA foreign_keys = OFF")
    conn.execute("DROP TRIGGER IF EXISTS tr_locations_insert")
    conn.execute("DROP TRIGGER IF EXISTS tr_locations_update")
    conn.execute("DROP TRIGGER IF EXISTS tr_locations_delete")
    
    cursor = conn.cursor()
    count = 0
    rtree_count = 0
    lt_count = 0
    
    with open(locations_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        
        batch_locations = []
        batch_rtree = []
        batch_lt = []
        
        for row in reader:
            try:
                location_id = int(row["id"])
                lat = float(row["lat"])
                lng = float(row["lng"])
            except (ValueError, KeyError):
                continue
            
            # Add to location batch
            batch_locations.append((
                location_id,
                lat,
                lng,
                parse_bool(row.get("unverified", "")),
                row.get("description") or None,
                row.get("season_start") or None,
                row.get("season_stop") or None,
                parse_bool(row.get("no_season", "")),
                row.get("author") or None,
                row.get("address") or None,
                row.get("access") or None,
                row.get("import_link") or None,
                row.get("original_ids") or None,
                parse_bool(row.get("hidden", "")),
                row.get("created_at") or None,
                row.get("updated_at") or None
            ))
            
            # Add to R-tree batch
            batch_rtree.append((location_id, lat, lat, lng, lng))
            
            # Parse type_ids and add to location_types batch
            type_ids_str = row.get("type_ids", "").strip("[]")
            if type_ids_str:
                for tid in type_ids_str.split(","):
                    tid = tid.strip()
                    if tid:
                        try:
                            batch_lt.append((location_id, int(tid)))
                        except ValueError:
                            pass
            
            # Process batch when it reaches the batch size
            if len(batch_locations) >= BATCH_SIZE:
                # Insert locations
                cursor.executemany("""
                    INSERT INTO locations (
                        id, lat, lng, unverified, description, season_start, season_stop,
                        no_season, author, address, access, import_link, original_ids,
                        hidden, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, batch_locations)
                
                # Insert R-tree entries
                cursor.executemany(
                    "INSERT INTO locations_rtree (id, min_lat, max_lat, min_lng, max_lng) VALUES (?, ?, ?, ?, ?)",
                    batch_rtree
                )
                
                # Insert location_types
                cursor.executemany(
                    "INSERT OR IGNORE INTO location_types (location_id, type_id) VALUES (?, ?)",
                    batch_lt
                )
                
                # Commit and update counts
                conn.commit()
                count += len(batch_locations)
                rtree_count += len(batch_rtree)
                lt_count += len(batch_lt)
                
                # Clear batches to free memory
                batch_locations = []
                batch_rtree = []
                batch_lt = []
                
                if count % 100000 == 0:
                    log(f"  Imported {count:,} locations...")
        
        # Process remaining batch
        if batch_locations:
            cursor.executemany("""
                INSERT INTO locations (
                    id, lat, lng, unverified, description, season_start, season_stop,
                    no_season, author, address, access, import_link, original_ids,
                    hidden, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, batch_locations)
            
            cursor.executemany(
                "INSERT INTO locations_rtree (id, min_lat, max_lat, min_lng, max_lng) VALUES (?, ?, ?, ?, ?)",
                batch_rtree
            )
            
            cursor.executemany(
                "INSERT OR IGNORE INTO location_types (location_id, type_id) VALUES (?, ?)",
                batch_lt
            )
            
            conn.commit()
            count += len(batch_locations)
            rtree_count += len(batch_rtree)
            lt_count += len(batch_lt)
    
    log(f"  Imported {count:,} locations")
    log(f"  Indexed {rtree_count:,} locations in R-tree")
    log(f"  Created {lt_count:,} location-type links")
    
    # Recreate triggers and re-enable foreign keys
    log("  Recreating triggers...")
    conn.executescript("""
        CREATE TRIGGER IF NOT EXISTS tr_locations_insert
        AFTER INSERT ON locations
        BEGIN
            INSERT INTO locations_rtree (id, min_lat, max_lat, min_lng, max_lng)
            VALUES (NEW.id, NEW.lat, NEW.lat, NEW.lng, NEW.lng);
        END;

        CREATE TRIGGER IF NOT EXISTS tr_locations_update
        AFTER UPDATE OF lat, lng ON locations
        BEGIN
            UPDATE locations_rtree 
            SET min_lat = NEW.lat, max_lat = NEW.lat,
                min_lng = NEW.lng, max_lng = NEW.lng
            WHERE id = NEW.id;
        END;

        CREATE TRIGGER IF NOT EXISTS tr_locations_delete
        AFTER DELETE ON locations
        BEGIN
            DELETE FROM locations_rtree WHERE id = OLD.id;
        END;
    """)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.commit()
    
    return count


def optimize_database(conn: sqlite3.Connection) -> None:
    """Run optimization after import."""
    log("Optimizing database...")
    conn.execute("ANALYZE")
    log("  Analysis complete")
    # Skip VACUUM on low-memory systems - it requires significant temp space
    # conn.execute("VACUUM")
    conn.commit()
    log("  Optimization complete")


def main():
    parser = argparse.ArgumentParser(description="Import Falling Fruit data into SQLite")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help=f"Directory containing CSV files (default: {DEFAULT_DATA_DIR})"
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"Output database path (default: {DEFAULT_DB_PATH})"
    )
    args = parser.parse_args()
    
    log("=" * 50)
    log("Falling Fruit Data Import (Memory-Optimized)")
    log("=" * 50)
    
    # Create database
    conn = create_database(args.db_path)
    
    try:
        # Import types first (for foreign key references)
        types_count = import_types(conn, args.data_dir)
        
        # Import locations
        locations_count = import_locations(conn, args.data_dir)
        
        # Optimize
        optimize_database(conn)
        
        # Summary
        log("=" * 50)
        log("Import Summary:")
        log(f"  Types:     {types_count:,}")
        log(f"  Locations: {locations_count:,}")
        log(f"  Database:  {args.db_path}")
        log(f"  Size:      {args.db_path.stat().st_size / (1024*1024):.1f} MB")
        log("=" * 50)
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()
