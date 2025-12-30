# Rising Fruit Backend
# Base image with tools for data sync and future API server

FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bzip2 \
    curl \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create data directory
RUN mkdir -p /app/data /app/scripts

# Copy scripts first and ensure they're executable
COPY scripts/sync-data.sh /app/scripts/sync-data.sh
RUN chmod +x /app/scripts/sync-data.sh && \
    sed -i 's/\r$//' /app/scripts/sync-data.sh

# Copy application code (for future API server)
COPY . /app/

# Install Python dependencies (placeholder for future)
# COPY requirements.txt /app/
# RUN pip install --no-cache-dir -r requirements.txt

# Run initial data sync on container start
# Then keep container running for future API server
CMD ["/bin/bash", "-c", "/app/scripts/sync-data.sh && tail -f /dev/null"]
