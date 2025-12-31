#!/bin/bash
#
# sync-data.sh
# Downloads and decompresses Falling Fruit data exports
#
# Usage: ./sync-data.sh [--force]
#   --force  Re-download even if files exist
#

set -euo pipefail

# Configuration
DATA_DIR="${DATA_DIR:-/app/data}"
LOCATIONS_URL="https://fallingfruit.org/locations.csv.bz2"
TYPES_URL="https://fallingfruit.org/types.csv.bz2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse arguments
FORCE=false
if [[ "${1:-}" == "--force" ]]; then
    FORCE=true
fi

# Ensure data directory exists
mkdir -p "$DATA_DIR"
cd "$DATA_DIR"

download_and_extract() {
    local url="$1"
    local compressed_file="$2"
    local output_file="$3"
    
    # Check if output already exists
    if [[ -f "$output_file" && "$FORCE" == "false" ]]; then
        log_info "$output_file already exists, skipping (use --force to re-download)"
        return 0
    fi
    
    log_info "Downloading $compressed_file..."
    
    # Download with progress and error handling
    if ! curl -fSL --progress-bar -o "$compressed_file" "$url"; then
        log_error "Failed to download $url"
        return 1
    fi
    
    log_info "Decompressing $compressed_file..."
    
    # Decompress (bzip2 -d removes the .bz2 file, -k keeps it, -f forces overwrite)
    if ! bzip2 -dkf "$compressed_file"; then
        log_error "Failed to decompress $compressed_file"
        return 1
    fi
    
    # Verify output exists
    if [[ ! -f "$output_file" ]]; then
        log_error "Expected output file $output_file not found after decompression"
        return 1
    fi
    
    # Show file info
    local size=$(du -h "$output_file" | cut -f1)
    local lines=$(wc -l < "$output_file")
    log_info "$output_file: $size, $lines lines"
    
    return 0
}

main() {
    log_info "Starting Falling Fruit data sync..."
    log_info "Data directory: $DATA_DIR"
    
    local exit_code=0
    
    # Download locations
    if ! download_and_extract "$LOCATIONS_URL" "locations.csv.bz2" "locations.csv"; then
        exit_code=1
    fi
    
    # Download types
    if ! download_and_extract "$TYPES_URL" "types.csv.bz2" "types.csv"; then
        exit_code=1
    fi
    
    if [[ $exit_code -eq 0 ]]; then
        log_info "Data sync completed successfully!"
        
        # Create a timestamp file for tracking
        date -u +"%Y-%m-%dT%H:%M:%SZ" > "$DATA_DIR/.last_sync"
        log_info "Last sync: $(cat "$DATA_DIR/.last_sync")"
    else
        log_error "Data sync completed with errors"
    fi
    
    return $exit_code
}

main "$@"



