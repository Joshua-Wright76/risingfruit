# Rising Fruit Backend
# Python API server with SQLite database

FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bzip2 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create directories
RUN mkdir -p /app/data /app/db /app/src

# Copy requirements first for better caching
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app/

# Ensure scripts are executable
RUN chmod +x /app/scripts/*.sh && \
    sed -i 's/\r$//' /app/scripts/*.sh

# Environment variables
ENV DATABASE_PATH=/app/data/risingfruit.db
ENV PORT=8000
ENV PYTHONPATH=/app

# Expose API port
EXPOSE 8000

# Startup script: sync data, import to DB if needed, start API
CMD ["bash", "-c", "\
    echo 'Starting Rising Fruit Backend...' && \
    /app/scripts/sync-data.sh && \
    if [ ! -f /app/data/risingfruit.db ]; then \
        echo 'Database not found, importing data...' && \
        python /app/db/import.py --data-dir /app/data --db-path /app/data/risingfruit.db; \
    else \
        echo 'Database already exists, skipping import'; \
    fi && \
    echo 'Starting API server...' && \
    uvicorn src.main:app --host 0.0.0.0 --port 8000 \
"]
