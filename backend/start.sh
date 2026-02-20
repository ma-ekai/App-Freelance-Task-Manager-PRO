#!/bin/bash

# Apply migrations
echo "Applying database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
node dist/index.js
