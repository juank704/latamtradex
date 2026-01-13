FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared modules
COPY shared /app/shared

# Copy package files
COPY catalog-service/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY catalog-service/ ./

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY catalog-service/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy shared modules
COPY --from=builder /app/shared /app/shared

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3002

# Start application
CMD ["node", "dist/src/main"]
