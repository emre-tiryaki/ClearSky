FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend
RUN npm ci

WORKDIR /app
COPY shared ./shared
COPY frontend ./frontend

WORKDIR /app/frontend

ARG VITE_GRAPHQL_WS_URL
ENV VITE_GRAPHQL_WS_URL=${VITE_GRAPHQL_WS_URL}

ARG VITE_GRAPHQL_HTTP_URL
ENV VITE_GRAPHQL_HTTP_URL=${VITE_GRAPHQL_HTTP_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]