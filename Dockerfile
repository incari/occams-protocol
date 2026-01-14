# Frontend build stage
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy frontend source
COPY . .

# Set environment variables for build
ARG VITE_STORAGE_MODE=api
ARG VITE_API_URL=/api
ENV VITE_STORAGE_MODE=$VITE_STORAGE_MODE
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
RUN yarn build

# Backend build stage
FROM node:20-alpine AS backend-build

WORKDIR /app/server

# Copy backend package files
COPY server/package.json ./
RUN npm install --production

# Production stage
FROM node:20-alpine AS production

# Install required packages for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy backend files
COPY server/package.json ./server/
WORKDIR /app/server
RUN npm install --production

COPY server/*.js ./

# Copy built frontend
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist ./public

# Create data directory for SQLite
RUN mkdir -p /app/server/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/server/data/occam.db

# Expose port
EXPOSE 3001

WORKDIR /app/server

# Start the server
CMD ["node", "index.js"]

