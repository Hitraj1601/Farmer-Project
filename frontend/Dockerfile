# Stage 1: Build React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Set relative API URL during build time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the React application
RUN npm run build

# Stage 2: Serve compiled assets with Nginx
FROM nginx:stable-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built frontend assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
