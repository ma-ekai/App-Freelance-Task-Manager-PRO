# Build stage
FROM node:18-bookworm AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Generate Prisma client
RUN npx prisma generate && echo "schema-v2-subtask"

# Copy rest of files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["sh", "-c", "node node_modules/prisma/build/index.js db push && node dist/index.js"]

