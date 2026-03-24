# Distributed URL Shortener Backend

Production-grade URL shortener using Node.js, Express, PostgreSQL, Redis, and Docker. This version includes JWT auth, tenant quotas, and queue-based analytics processing with BullMQ.

## Folder Structure

src/
  analytics/
    clickTracker.js
  config/
    bullmq.js
    db.js
    env.js
    logger.js
    redis.js
  controllers/
    analyticsController.js
    authController.js
    redirectController.js
    urlController.js
    userController.js
  middlewares/
    authenticateJwt.js
    errorHandler.js
    notFound.js
    rateLimiter.js
    validateRequest.js
  models/
    analyticsModel.js
    idModel.js
    urlModel.js
    userModel.js
  routes/
    analyticsRoutes.js
    authRoutes.js
    redirectRoutes.js
    urlRoutes.js
    userRoutes.js
  services/
    analyticsQueueService.js
    analyticsService.js
    authService.js
    idService.js
    quotaService.js
    redisCacheService.js
    urlService.js
  utils/
    authValidator.js
    base62.js
    requestMeta.js
    urlValidator.js
  workers/
    analyticsWorker.js
  app.js
  server.js

database/
  schema.sql

load-tests/
  redirect-load-test.js

tests/
  integration/
    api.test.js
  unit/
    base62.test.js
    quotaService.test.js
    rateLimiter.test.js
    urlValidator.test.js

scripts/
  applySchema.js

## Folder Responsibilities

- src/controllers: HTTP handlers, request/response orchestration.
- src/services: business logic (auth, quotas, queue publishing, URL resolution).
- src/models: SQL data access for users, URLs, analytics.
- src/middlewares: JWT verification, rate limiting, validation, error handling.
- src/config: infrastructure clients and runtime settings (Redis, PostgreSQL, BullMQ).
- src/workers: async consumers for analytics queue jobs.
- src/utils: Base62, request metadata parsing, input validation schemas.
- tests: unit and integration tests.
- load-tests: k6 scenarios for redirect throughput testing.

## Database Schema Updates

See database/schema.sql.

### users table

- id BIGSERIAL PRIMARY KEY
- email VARCHAR(320) UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- plan_type VARCHAR(16) NOT NULL DEFAULT 'free' CHECK (free|pro)
- created_at TIMESTAMPTZ

### short_urls table

- id BIGSERIAL PRIMARY KEY
- original_url TEXT NOT NULL
- short_code VARCHAR(32) UNIQUE NOT NULL
- click_count BIGINT DEFAULT 0
- created_at TIMESTAMPTZ
- expires_at TIMESTAMPTZ NULL
- user_id BIGINT NOT NULL REFERENCES users(id)

### click_analytics table

- id BIGSERIAL PRIMARY KEY
- short_code VARCHAR(32) REFERENCES short_urls(short_code)
- clicked_at TIMESTAMPTZ
- ip_address INET
- user_agent TEXT
- country VARCHAR(64) NULL
- device_type VARCHAR(32) NULL

### Performance indexes

- users(email), users(plan_type)
- short_urls(short_code), short_urls(user_id), short_urls(expires_at), short_urls(created_at DESC)
- click_analytics(short_code, clicked_at DESC), click_analytics(clicked_at DESC), click_analytics(country), click_analytics(device_type)

## Authentication Endpoints

- POST /auth/register
  - body: { "email": "user@example.com", "password": "secret123", "planType": "free" }
- POST /auth/login
  - body: { "email": "user@example.com", "password": "secret123" }
- GET /api/my-links
  - requires Authorization: Bearer <jwt>
  - returns all links created by the authenticated user

JWT is verified by middleware in src/middlewares/authenticateJwt.js.

## Quota Enforcement

Quota is checked before URL creation using src/services/quotaService.js.

- free: 100 links/user
- pro: 10,000 links/user

When quota is exceeded, API responds with a 403 QuotaExceededError.

## Queue-Based Analytics

Redirect endpoint no longer writes analytics directly to PostgreSQL.

Flow:
1. GET /:shortCode resolves URL and redirects immediately.
2. Redirect handler pushes click payload to BullMQ queue.
3. Worker process consumes queue jobs and writes analytics rows.
4. Worker also increments click_count asynchronously.

Queue producer: src/services/analyticsQueueService.js
Worker: src/workers/analyticsWorker.js

## API Endpoints

- POST /api/shorten (JWT protected)
- GET /:shortCode
- GET /api/analytics/:shortCode
- GET /api/my-links (JWT protected)
- GET /health

## Unit Tests (Jest)

- tests/unit/base62.test.js
- tests/unit/urlValidator.test.js
- tests/unit/quotaService.test.js
- tests/unit/rateLimiter.test.js

Run:

- npm run test:unit

## Integration Tests (supertest)

- tests/integration/api.test.js
  - POST /api/shorten
  - GET /:shortCode
  - GET /api/analytics/:shortCode

Run:

- npm run test:integration

## Load Test (k6)

Script: load-tests/redirect-load-test.js

Command:

- k6 run -e BASE_URL=http://localhost:3000 -e SHORT_CODE=abc load-tests/redirect-load-test.js

Default profile simulates 10,000 redirect requests.

## Environment Variables

See .env.example for all values including:

- JWT_SECRET, JWT_EXPIRES_IN
- BCRYPT_SALT_ROUNDS
- FREE_PLAN_URL_QUOTA, PRO_PLAN_URL_QUOTA
- ANALYTICS_QUEUE_NAME

## Run with Docker

1. Copy .env.example to .env.
2. Start services: docker compose up --build.
3. API listens on port 3000.
4. Separate worker service processes analytics queue jobs.

## Host in Production (VPS + Docker Compose)

This is the fastest path to host the full stack (API + worker + PostgreSQL + Redis) on one server.

### 1) Prepare server

- Create an Ubuntu 22.04 VPS (2 vCPU, 4 GB RAM recommended).
- Point your domain DNS A record to the VPS IP.
- Install Docker and Compose plugin:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2) Deploy app files

```bash
git clone <your-repo-url> url-shortener
cd url-shortener
cp .env.example .env
```

Edit `.env` for production:

- `NODE_ENV=production`
- `BASE_URL=https://your-domain.com`
- `JWT_SECRET=<long-random-secret>`
- `POSTGRES_PASSWORD=<strong-password>`

### 3) Start services

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

If this is a fresh deployment, schema is auto-applied from `database/schema.sql` on first PostgreSQL startup.

### 4) Put HTTPS in front (Caddy)

Install Caddy:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

Create `/etc/caddy/Caddyfile`:

```caddyfile
your-domain.com {
  reverse_proxy 127.0.0.1:3000
}
```

Then reload:

```bash
sudo systemctl reload caddy
```

Caddy automatically provisions and renews TLS certificates.

### 5) Verify

- `https://your-domain.com/health`
- `https://your-domain.com/login`

### 6) Operations

Update deployment:

```bash
git pull
docker compose up -d --build
```

Backups:

- Persisted data is stored in Docker volumes `postgres_data` and `redis_data`.
- Back up PostgreSQL regularly with `pg_dump` from the running container.

## Minimal Cloud Alternative

If you prefer managed services instead of a VPS:

- Host API + worker on Railway or Render.
- Host PostgreSQL on Neon/Supabase/Railway Postgres.
- Host Redis on Upstash or Redis Cloud.

Set the same environment variables from `.env.example`, especially `BASE_URL`, DB host/credentials, Redis host/credentials, and `JWT_SECRET`.

## Deploy on Render

Use this when you host on Render with managed PostgreSQL + Redis.

### Render services

Create these services in Render:

- Web Service: runs `npm start`
- Background Worker: runs `npm run start:worker`
- PostgreSQL: managed database
- Redis: managed cache/queue

Use the same Git repo/branch for both Web and Worker.

### Build and start commands

- Build command: `npm ci`
- Web start command: `npm run db:schema && npm start`
- Worker start command: `npm run start:worker`

The schema command is safe to run repeatedly because schema SQL uses `IF NOT EXISTS`.

### Required environment variables

Set these on both Web and Worker:

- `NODE_ENV=production`
- `BASE_URL=https://<your-render-domain-or-custom-domain>`
- `JWT_SECRET=<long-random-secret>`
- `JWT_EXPIRES_IN=1d`
- `ANALYTICS_QUEUE_NAME=analytics-events`

For database and Redis, either provide URL style variables from Render:

- `DATABASE_URL=<Render PostgreSQL External/Private URL>`
- `REDIS_URL=<Render Redis URL>`

Or provide expanded host variables:

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`

This project now supports both styles.

### Health check

Set Render health check path to:

- `/health`

### First deploy checklist

1. Deploy PostgreSQL and Redis first.
2. Add env vars to Web and Worker.
3. Deploy Web (runs schema + API).
4. Deploy Worker.
5. Verify:
  - `GET /health` returns status ok.
  - Register/login works.
  - Shorten URL works.
  - Redirect increments analytics asynchronously.
