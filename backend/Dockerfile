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
RUN mkdir -p /app/data

# Copy everything
COPY . /app/

# Ensure scripts are executable (fix line endings and permissions)
RUN chmod +x /app/scripts/*.sh && \
    sed -i 's/\r$//' /app/scripts/*.sh

# Install Python dependencies (placeholder for future)
# RUN pip install --no-cache-dir -r requirements.txt

# Run initial data sync on container start, then keep container alive
CMD ["bash", "-c", "bash /app/scripts/sync-data.sh && echo 'Sync complete. Container staying alive...' && tail -f /dev/null"]
