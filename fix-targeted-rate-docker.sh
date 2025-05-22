#!/bin/bash

# This script runs the targeted_rate column fix within the Docker container

echo "Running fix-targeted-rate.sh script in Docker container..."
docker-compose exec server bash -c "cd /app && ./fix-targeted-rate.sh"

echo "Done!"
