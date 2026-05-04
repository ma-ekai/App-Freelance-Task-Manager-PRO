#!/bin/bash

# Sync database schema (creates/updates tables)
echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push --accept-data-loss

# Start the application
echo "Starting application..."
node dist/index.js
