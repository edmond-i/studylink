# Multi-stage build for StudyLink

# Builder stage
FROM node:18 AS builder
WORKDIR /app

# copy root package files for installing deps if needed (though server and client have own packages)
COPY server/package*.json server/
COPY client/package*.json client/

# install client deps and build
WORKDIR /app/client
RUN npm ci
RUN npm run build

# install server deps
WORKDIR /app/server
RUN npm ci

# Production image
FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
