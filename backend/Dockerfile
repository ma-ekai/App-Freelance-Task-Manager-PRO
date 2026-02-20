# Build stage
FROM node:18-buster AS builder
WORKDIR /app

# Install dependencies for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy rest of files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-buster-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY start.sh .
RUN chmod +x start.sh
EXPOSE 4000
CMD ["./start.sh"]
