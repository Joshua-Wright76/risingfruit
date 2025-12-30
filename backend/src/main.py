"""
Rising Fruit API Server

FastAPI application providing REST endpoints for the Falling Fruit data.
"""

import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database import (
    db,
    get_locations_in_bounds,
    get_location_by_id,
    get_all_types,
    get_type_by_id,
    get_stats,
)


# ============================================
# Pydantic Models
# ============================================

class LocationSummary(BaseModel):
    """Location summary for list views."""
    id: int
    lat: float
    lng: float
    description: Optional[str] = None
    access: Optional[str] = None
    season_start: Optional[str] = None
    season_stop: Optional[str] = None
    type_ids: list[int] = []
    unverified: bool = False


class LocationDetail(LocationSummary):
    """Full location details."""
    author: Optional[str] = None
    address: Optional[str] = None
    no_season: bool = False
    import_link: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    types: list[dict] = []


class TypeSummary(BaseModel):
    """Type summary for list views."""
    id: int
    en_name: Optional[str] = None
    scientific_name: Optional[str] = None
    category_mask: Optional[str] = None
    parent_id: Optional[int] = None
    parent_name: Optional[str] = None


class TypeDetail(TypeSummary):
    """Full type details."""
    taxonomic_rank: Optional[str] = None
    wikipedia_url: Optional[str] = None
    localized_names: dict = {}
    children: list[dict] = []
    location_count: int = 0


class LocationsResponse(BaseModel):
    """Response for locations list endpoint."""
    count: int
    locations: list[LocationSummary]


class TypesResponse(BaseModel):
    """Response for types list endpoint."""
    count: int
    types: list[TypeSummary]


class StatsResponse(BaseModel):
    """Response for stats endpoint."""
    locations_total: int
    locations_verified: int
    types_total: int


class HealthResponse(BaseModel):
    """Response for health check."""
    status: str
    database: str


# ============================================
# Application Setup
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    await db.connect()
    yield
    # Shutdown
    await db.disconnect()


app = FastAPI(
    title="Rising Fruit API",
    description="REST API for Falling Fruit foraging location data",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Endpoints
# ============================================

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        await db.fetch_value("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        database=db_status
    )


@app.get("/api/stats", response_model=StatsResponse, tags=["System"])
async def get_statistics():
    """Get database statistics."""
    stats = await get_stats(db)
    return StatsResponse(**stats)


@app.get("/api/locations", response_model=LocationsResponse, tags=["Locations"])
async def list_locations(
    sw_lat: float = Query(..., description="Southwest latitude", ge=-90, le=90),
    sw_lng: float = Query(..., description="Southwest longitude", ge=-180, le=180),
    ne_lat: float = Query(..., description="Northeast latitude", ge=-90, le=90),
    ne_lng: float = Query(..., description="Northeast longitude", ge=-180, le=180),
    types: Optional[str] = Query(None, description="Comma-separated type IDs to filter"),
    limit: int = Query(1000, description="Max results", ge=1, le=5000),
    offset: int = Query(0, description="Pagination offset", ge=0),
    verified_only: bool = Query(False, description="Only return verified locations"),
):
    """
    Get locations within a bounding box.
    
    Uses R-tree spatial index for efficient queries.
    """
    # Parse type IDs if provided
    type_ids = None
    if types:
        try:
            type_ids = [int(tid.strip()) for tid in types.split(",") if tid.strip()]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid type IDs format")
    
    locations = await get_locations_in_bounds(
        db,
        sw_lat=sw_lat,
        sw_lng=sw_lng,
        ne_lat=ne_lat,
        ne_lng=ne_lng,
        type_ids=type_ids,
        limit=limit,
        offset=offset,
        include_unverified=not verified_only,
    )
    
    return LocationsResponse(
        count=len(locations),
        locations=[LocationSummary(**loc) for loc in locations]
    )


@app.get("/api/locations/{location_id}", response_model=LocationDetail, tags=["Locations"])
async def get_location(location_id: int):
    """Get details for a specific location."""
    location = await get_location_by_id(db, location_id)
    
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    
    return LocationDetail(**location)


@app.get("/api/types", response_model=TypesResponse, tags=["Types"])
async def list_types(
    category: Optional[str] = Query(None, description="Filter by category (forager, honeybee, grafter, freegan)"),
    search: Optional[str] = Query(None, description="Search by name", min_length=2),
):
    """
    Get all plant/food types.
    
    Optionally filter by category or search term.
    """
    types = await get_all_types(db, category=category, search=search)
    
    return TypesResponse(
        count=len(types),
        types=[TypeSummary(**t) for t in types]
    )


@app.get("/api/types/{type_id}", response_model=TypeDetail, tags=["Types"])
async def get_type(type_id: int):
    """Get details for a specific plant type."""
    type_data = await get_type_by_id(db, type_id)
    
    if type_data is None:
        raise HTTPException(status_code=404, detail="Type not found")
    
    return TypeDetail(**type_data)


# ============================================
# Main entry point
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true",
    )

