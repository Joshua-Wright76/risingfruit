"""
Database connection utilities for Rising Fruit.

Uses aiosqlite for async SQLite access with connection pooling.
"""

import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, AsyncGenerator, Optional

import aiosqlite

# Database path from environment or default
DB_PATH = Path(os.getenv("DATABASE_PATH", "/app/data/risingfruit.db"))


class Database:
    """Async SQLite database wrapper."""
    
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._connection: Optional[aiosqlite.Connection] = None
    
    async def connect(self) -> None:
        """Open database connection."""
        if self._connection is None:
            self._connection = await aiosqlite.connect(
                str(self.db_path),
                check_same_thread=False
            )
            # Enable row factory for dict-like access
            self._connection.row_factory = aiosqlite.Row
            # Performance settings
            await self._connection.execute("PRAGMA journal_mode=WAL")
            await self._connection.execute("PRAGMA synchronous=NORMAL")
            await self._connection.execute("PRAGMA cache_size=-64000")
    
    async def disconnect(self) -> None:
        """Close database connection."""
        if self._connection is not None:
            await self._connection.close()
            self._connection = None
    
    @property
    def connection(self) -> aiosqlite.Connection:
        """Get the database connection."""
        if self._connection is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._connection
    
    async def execute(self, query: str, params: tuple = ()) -> aiosqlite.Cursor:
        """Execute a query."""
        return await self.connection.execute(query, params)
    
    async def fetch_one(self, query: str, params: tuple = ()) -> Optional[dict]:
        """Fetch a single row as dict."""
        cursor = await self.execute(query, params)
        row = await cursor.fetchone()
        if row is None:
            return None
        return dict(row)
    
    async def fetch_all(self, query: str, params: tuple = ()) -> list[dict]:
        """Fetch all rows as list of dicts."""
        cursor = await self.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    async def fetch_value(self, query: str, params: tuple = ()) -> Any:
        """Fetch a single value."""
        cursor = await self.execute(query, params)
        row = await cursor.fetchone()
        if row is None:
            return None
        return row[0]


# Global database instance
db = Database()


@asynccontextmanager
async def get_db() -> AsyncGenerator[Database, None]:
    """Dependency for FastAPI routes."""
    yield db


# ============================================
# Query helpers
# ============================================

async def get_locations_in_bounds(
    db: Database,
    sw_lat: float,
    sw_lng: float,
    ne_lat: float,
    ne_lng: float,
    type_ids: Optional[list[int]] = None,
    limit: int = 1000,
    offset: int = 0,
    include_unverified: bool = True
) -> list[dict]:
    """
    Get locations within a bounding box using R-tree index.
    
    Args:
        sw_lat: Southwest latitude
        sw_lng: Southwest longitude
        ne_lat: Northeast latitude
        ne_lng: Northeast longitude
        type_ids: Optional filter by type IDs
        limit: Max results (default 1000)
        offset: Pagination offset
        include_unverified: Include unverified locations
    
    Returns:
        List of location dicts
    """
    # Base query using R-tree for spatial filtering
    query = """
        SELECT 
            l.id, l.lat, l.lng, l.description, l.access,
            l.season_start, l.season_stop, l.author,
            l.unverified, l.created_at, l.updated_at,
            GROUP_CONCAT(DISTINCT lt.type_id) as type_ids
        FROM locations l
        INNER JOIN locations_rtree r ON l.id = r.id
        LEFT JOIN location_types lt ON l.id = lt.location_id
        WHERE r.min_lat <= ? AND r.max_lat >= ?
          AND r.min_lng <= ? AND r.max_lng >= ?
          AND l.hidden = 0
    """
    params: list = [ne_lat, sw_lat, ne_lng, sw_lng]
    
    if not include_unverified:
        query += " AND l.unverified = 0"
    
    if type_ids:
        placeholders = ",".join("?" * len(type_ids))
        query += f" AND lt.type_id IN ({placeholders})"
        params.extend(type_ids)
    
    query += " GROUP BY l.id ORDER BY l.id LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    rows = await db.fetch_all(query, tuple(params))
    
    # Parse type_ids string to list
    for row in rows:
        if row.get("type_ids"):
            row["type_ids"] = [int(tid) for tid in row["type_ids"].split(",")]
        else:
            row["type_ids"] = []
    
    return rows


async def get_location_by_id(db: Database, location_id: int) -> Optional[dict]:
    """Get a single location with its type details."""
    location = await db.fetch_one("""
        SELECT 
            l.*,
            GROUP_CONCAT(DISTINCT lt.type_id) as type_ids
        FROM locations l
        LEFT JOIN location_types lt ON l.id = lt.location_id
        WHERE l.id = ? AND l.hidden = 0
        GROUP BY l.id
    """, (location_id,))
    
    if location is None:
        return None
    
    # Parse type_ids and get type details
    if location.get("type_ids"):
        type_ids = [int(tid) for tid in location["type_ids"].split(",")]
        location["type_ids"] = type_ids
        
        # Get type details
        if type_ids:
            placeholders = ",".join("?" * len(type_ids))
            types = await db.fetch_all(f"""
                SELECT id, en_name, scientific_name, category_mask
                FROM types WHERE id IN ({placeholders})
            """, tuple(type_ids))
            location["types"] = types
    else:
        location["type_ids"] = []
        location["types"] = []
    
    return location


async def get_all_types(
    db: Database,
    category: Optional[str] = None,
    search: Optional[str] = None
) -> list[dict]:
    """Get all plant types, optionally filtered."""
    query = """
        SELECT 
            t.id, t.en_name, t.scientific_name, t.taxonomic_rank,
            t.category_mask, t.wikipedia_url, t.parent_id,
            t.localized_names,
            p.en_name as parent_name
        FROM types t
        LEFT JOIN types p ON t.parent_id = p.id
        WHERE t.pending = 0
    """
    params: list = []
    
    if category:
        query += " AND t.category_mask LIKE ?"
        params.append(f"%{category}%")
    
    if search:
        query += " AND (t.en_name LIKE ? OR t.scientific_name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query += " ORDER BY t.en_name"
    
    rows = await db.fetch_all(query, tuple(params))
    
    # Parse localized_names JSON
    for row in rows:
        if row.get("localized_names"):
            try:
                row["localized_names"] = json.loads(row["localized_names"])
            except json.JSONDecodeError:
                row["localized_names"] = {}
        else:
            row["localized_names"] = {}
    
    return rows


async def get_type_by_id(db: Database, type_id: int) -> Optional[dict]:
    """Get a single type with full details."""
    type_data = await db.fetch_one("""
        SELECT 
            t.*,
            p.en_name as parent_name
        FROM types t
        LEFT JOIN types p ON t.parent_id = p.id
        WHERE t.id = ? AND t.pending = 0
    """, (type_id,))
    
    if type_data is None:
        return None
    
    # Parse localized_names JSON
    if type_data.get("localized_names"):
        try:
            type_data["localized_names"] = json.loads(type_data["localized_names"])
        except json.JSONDecodeError:
            type_data["localized_names"] = {}
    else:
        type_data["localized_names"] = {}
    
    # Get child types
    children = await db.fetch_all("""
        SELECT id, en_name, scientific_name
        FROM types WHERE parent_id = ? AND pending = 0
        ORDER BY en_name
    """, (type_id,))
    type_data["children"] = children
    
    # Get location count for this type
    count = await db.fetch_value("""
        SELECT COUNT(*) FROM location_types WHERE type_id = ?
    """, (type_id,))
    type_data["location_count"] = count or 0
    
    return type_data


async def get_stats(db: Database) -> dict:
    """Get database statistics."""
    locations_count = await db.fetch_value("SELECT COUNT(*) FROM locations WHERE hidden = 0")
    types_count = await db.fetch_value("SELECT COUNT(*) FROM types WHERE pending = 0")
    verified_count = await db.fetch_value("SELECT COUNT(*) FROM locations WHERE hidden = 0 AND unverified = 0")
    
    return {
        "locations_total": locations_count or 0,
        "locations_verified": verified_count or 0,
        "types_total": types_count or 0
    }



