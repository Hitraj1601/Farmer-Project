# Stage 1: Build dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Prisma generation
FROM node:20-alpine AS prisma-generator

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all deps (including dev for prisma CLI)
RUN npm ci

# Copy Prisma schema
COPY src/prisma ./src/prisma

# Generate Prisma client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Stage 3: Production runtime
FROM node:20-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy Prisma schema and generated client from prisma-generator stage
COPY --from=prisma-generator /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma-generator /app/src/prisma ./src/prisma

# Copy application source
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Expose backend service port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start command: sync database schema first, then launch the node server directly
CMD ["sh", "-c", "npx prisma db push --schema=./src/prisma/schema.prisma --accept-data-loss && node app.js"]
