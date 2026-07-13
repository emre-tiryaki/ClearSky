FROM node:22-alpine AS build

WORKDIR /app

COPY services/device-interface/package*.json ./services/device-interface/

WORKDIR /app/services/device-interface
RUN npm ci

WORKDIR /app
COPY shared ./shared
COPY services/device-interface ./services/device-interface

WORKDIR /app/services/device-interface
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app/services/device-interface

COPY services/device-interface/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/services/device-interface/dist ./dist

CMD ["node", "dist/entrypoint/index.js"]
