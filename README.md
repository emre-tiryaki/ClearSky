# ClearSky

A real-time flight tracking dashboard built as a TypeScript/Node.js microservices monorepo. ClearSky ingests live aircraft state vectors from the OpenSky Network API, streams them to a browser-based map in real time, and lets users persist snapshots of individual aircraft for later reporting and route playback.

This project was built as an internship deliverable for Avikon, combining a working application with parallel design documentation (class diagrams, package diagrams, sequence diagrams, database design, and architectural design).

## Features

- **Live map view** — aircraft positions over Turkey are rendered on a Leaflet map and updated in real time via a GraphQL subscription, filtered to the visible viewport (bounding box).
- **Aircraft symbology** — markers rotate with heading and are color-coded by altitude/speed; category-specific icons (helicopter, heavy aircraft, drone, etc.) are used where available.
- **Save flight records** — clicking an aircraft and pressing "Save" persists its current live snapshot (plus an optional note) to MongoDB, transformed to the backend's schema.
- **Historical reporting** — a separate report page lets users query saved records by date range and view them in a table.
- **Speed-colored route playback** — selecting an aircraft renders its saved historical positions as a polyline colored from slow (blue) to fast (red).
- **System status banner** — the frontend surfaces upstream OpenSky rate-limit / auth issues reported by the backend.

## Architecture

Three independent services communicate over RabbitMQ and GraphQL, orchestrated with Docker Compose:

```
OpenSky Network API
        |
        v
device-interface  --(RabbitMQ, topic exchange)-->  api-gateway  --(GraphQL: query/mutation/subscription)-->  frontend
                                                          |
                                                          v
                                                       MongoDB
```

- **`device-interface`** — polls the OpenSky `/states/all` endpoint (OAuth2 client-credentials auth) on a fixed interval, normalizes raw state vectors into the shared `FlightPosition` shape, and publishes them to RabbitMQ with routing key `flight.position.{icao24}`. Also publishes `system.status` health messages (rate-limit / auth errors) so the frontend can react.
- **`api-gateway`** — Fastify + Mercurius GraphQL server. Consumes RabbitMQ messages, keeps a short in-memory history per aircraft (`LiveFlightStore`), and re-publishes each position to GraphQL subscribers, filtered per-connection by their map bounding box. Handles the `saveFlightRecord` mutation by transforming the current live snapshot into a MongoDB document, and serves date-range / per-aircraft history queries for reporting.
- **`frontend`** — React + Vite + Tailwind + Leaflet. Subscribes to live positions over a GraphQL WebSocket connection, renders the map, and calls GraphQL queries/mutations over HTTP for saving and reporting.
- **`shared/`** — a small TypeScript-only package (no service logic) holding types used by all three services (`FlightPosition`, `SavedFlightRecord`, `BoundingBox`, `SystemStatus`, the `Wire<T>` date-serialization helper) so the data shape stays consistent across service boundaries.

Design rationale (dead-letter exchanges, why GraphQL over REST, why RabbitMQ decouples ingestion from the gateway, etc.) is documented in `Avikon/Proje planı/Dökümanlar/Mimari Tasarım.md` and the accompanying design docs.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (all services) |
| Backend framework | Fastify + Mercurius (GraphQL) |
| Messaging | RabbitMQ (`amqplib`), topic exchange |
| Database | MongoDB |
| Frontend | React, Vite, Tailwind CSS, Leaflet / react-leaflet |
| Realtime transport | `graphql-ws` (subscriptions over WebSocket) |
| Orchestration | Docker Compose |
| External data source | OpenSky Network API (OAuth2 client-credentials, Standard tier) |

## Repository Layout

```
.
├── docker-compose.yml
├── .env.example
├── shared/                      # shared TypeScript types (no runtime logic)
│   └── types/
├── services/
│   ├── device-interface/        # OpenSky polling + RabbitMQ publisher
│   └── api-gateway/             # RabbitMQ consumer + GraphQL server + MongoDB
└── frontend/                    # React SPA
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenSky Network API credentials (`client_id` / `client_secret`) — the anonymous tier is not viable for this project since a global poll exhausts the anonymous daily credit quota in roughly 25 minutes; a Turkey bounding box with authenticated polling is used instead.

### Run with Docker Compose (recommended)

1. Copy the root environment file and fill in your OpenSky credentials:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `OPENSKY_CLIENT_ID` and `OPENSKY_CLIENT_SECRET`. Change the default RabbitMQ/MongoDB passwords before any non-local use.

2. Start everything:

   ```bash
   docker compose up --build
   ```

   This builds and starts RabbitMQ, MongoDB, `device-interface`, `api-gateway`, and `frontend`.

3. Open the app:

   - Frontend: `http://localhost:${FRONTEND_PORT}` (default `8080`)
   - GraphiQL (if `GRAPHIQL_ENABLED=true`): `http://localhost:${API_GATEWAY_PORT}/graphiql`
   - RabbitMQ management UI: `http://localhost:${RABBITMQ_MANAGEMENT_PORT}` (default `15672`)

Docker Compose reads configuration exclusively from the root `.env` file; the `environment:` blocks in `docker-compose.yml` interpolate those values and pass Docker-network hostnames (`rabbitmq`, `mongodb`) to each service.

### Run services individually (without Docker)

Each service also has its own `.env.example` using `localhost` hostnames, for running outside Docker:

```bash
# device-interface
cd services/device-interface
cp .env.example .env   # fill in OpenSky credentials
npm install
npm run dev

# api-gateway
cd services/api-gateway
cp .env.example .env
npm install
npm run dev

# frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Note: this requires RabbitMQ and MongoDB to be reachable at `localhost`, e.g. via `docker compose up rabbitmq mongodb`.

## Data Flow (summary)

1. `device-interface` polls OpenSky `GET /states/all` (bounded to Turkey's airspace) every `POLL_INTERVAL_MS`, normalizes the response, and publishes each position to RabbitMQ.
2. `api-gateway` consumes those messages, updates its in-memory live store, and pushes updates to every connected GraphQL subscriber whose bounding box contains the position.
3. The frontend renders live positions on the map as they arrive.
4. When a user selects an aircraft and clicks **Save**, the frontend calls `saveFlightRecord`; `api-gateway` transforms the current in-memory snapshot into a MongoDB document (adding a timestamp and optional note) — no RabbitMQ involvement in this path, it's a direct synchronous GraphQL mutation.
5. The report page queries `flightRecords(startDate, endDate)` against an indexed MongoDB range query.
6. Selecting an aircraft's history calls `flightHistory(icao24)`, and the frontend colors the resulting polyline by recorded speed.

## Known Limitations / Out of Scope

- Authentication/authorization is not implemented.
- The OpenSky `/tracks` endpoint is intentionally not used (experimental, limited to the last 30 days, and redundant with the app's own persisted history).
- No dead-letter exchange is configured for RabbitMQ yet — unprocessable messages can currently be lost.
- Horizontal scaling beyond a single Docker Compose host (e.g. Kubernetes, a distributed pub/sub layer for multi-instance `api-gateway`) is out of scope for this iteration.
- Antimeridian crossing and global-zoom-out performance for the live map are known follow-up items.

## Design Documentation

Class diagrams, package diagrams, sequence diagrams, database design, and architectural design docs live under `Avikon/Proje planı/Dökümanlar/`.