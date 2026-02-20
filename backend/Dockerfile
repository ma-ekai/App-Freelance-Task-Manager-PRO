# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY start.sh .
RUN chmod +x start.sh
EXPOSE 4000
CMD ["./start.sh"]

