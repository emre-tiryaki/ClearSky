FROM node:22-alpine AS build

WORKDIR /app

COPY services/api-gateway/package*.json ./services/api-gateway/

WORKDIR /app/services/api-gateway
RUN npm ci

WORKDIR /app
COPY shared ./shared
COPY services/api-gateway ./services/api-gateway

WORKDIR /app/services/api-gateway
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app/services/api-gateway

COPY services/api-gateway/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/services/api-gateway/dist ./dist

CMD ["node", "dist/entrypoint/index.js"]