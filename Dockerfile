# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (needed for migrations and seeds)
RUN npm ci

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy source files needed for migrations and seeds
COPY --from=builder /app/src ./src

# Copy .env file (will be overridden by docker-compose env_file)
COPY .env* ./

# Expose port
EXPOSE 3000

# Start application
CMD ["sh", "-c", "npm run migration:run && npm run seed:all && node dist/main"]
