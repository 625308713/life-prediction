# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Build Backend ----
FROM node:20-alpine AS backend-build
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# ---- Stage 3: Production Runtime ----
FROM node:20-alpine
WORKDIR /app

# Copy backend build
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package.json ./backend/
COPY --from=backend-build /app/backend/prisma ./backend/prisma
COPY --from=backend-build /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Copy frontend build as static files
COPY --from=frontend-build /app/dist/public ./dist/public

# Copy env example for reference
COPY backend/.env.example ./backend/.env.example

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app/backend
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
