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
