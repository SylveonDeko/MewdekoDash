# syntax=docker/dockerfile:1

# ===== BUILD STAGE =====
FROM --platform=$BUILDPLATFORM node:20-alpine AS build
ARG TARGETARCH

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
# This runs sitemap generation and vite build
RUN npm run build

# ===== RUNTIME STAGE =====
FROM node:20-alpine AS runtime

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from build stage
# adapter-node outputs to "out/" directory
COPY --from=build /app/out ./out
COPY --from=build /app/static ./static

# Create directory for logs
RUN mkdir -p /app/logs

# Set environment variables
# BODY_SIZE_LIMIT is raised from the adapter-node default of 512K so image uploads
# (base64 encoded, up to 8MB of source image) reach the bot API.
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    BODY_SIZE_LIMIT=12M

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Run the application
# adapter-node creates an index.js in the out directory
CMD ["node", "out/index.js"]
