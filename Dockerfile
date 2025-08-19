# Multi-stage Dockerfile for Wholesaler React App

# Base stage with Node.js
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat curl

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm ci --no-audit --progress=false
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci --no-audit --progress=false
COPY . .

# Debug (optional; keep or remove to slim image)
RUN echo "=== DEBUGGING BUILD PROCESS ===" \
 && echo "PWD:" && pwd \
 && echo "=== SAMPLE FILES ===" && (find /app -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.html" -o -name "*.json" \) | head -20 || true) \
 && echo "=== main.jsx? ===" && (find /app -name "main.jsx" -type f || true) \
 && echo "=== src/ ===" && (ls -la /app/src/ 2>/dev/null || echo "❌ No src directory") \
 && echo "=== index.html ===" && (cat /app/index.html 2>/dev/null || echo "❌ No index.html") \
 && echo "=== @vitejs ===" && (ls -la /app/node_modules/@vitejs/ 2>/dev/null | head -5 || echo "❌ No @vitejs")

# Build-time env (Vite reads these at build)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

RUN echo "=== VITE_* ENV ===" && (env | grep ^VITE_ || echo "❌ No VITE vars")
RUN npm run build
RUN echo "=== DIST ===" && (ls -la /app/dist/ 2>/dev/null || echo "❌ No dist")

# Production stage with Nginx
FROM nginx:alpine AS production
RUN apk add --no-cache curl

# Copy custom nginx configuration (ensure it has: user nginx;)
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Ownership (root master process is fine; workers will drop to nginx)
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
