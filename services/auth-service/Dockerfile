FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared modules
COPY shared /app/shared

# Copy package files
COPY auth-service/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY auth-service/ ./

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY auth-service/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy shared modules
COPY --from=builder /app/shared /app/shared

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main"]
