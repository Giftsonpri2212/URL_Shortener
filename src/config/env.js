const dotenv = require("dotenv");

dotenv.config();

function parsePostgresUrl(connectionUrl) {
  if (!connectionUrl) {
    return null;
  }

  try {
    const parsed = new URL(connectionUrl);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      database: parsed.pathname ? parsed.pathname.replace(/^\//, "") : undefined,
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || "")
    };
  } catch (_error) {
    return null;
  }
}

function parseRedisUrl(connectionUrl) {
  if (!connectionUrl) {
    return null;
  }

  try {
    const parsed = new URL(connectionUrl);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
      db: Number((parsed.pathname || "/0").replace(/^\//, "") || 0)
    };
  } catch (_error) {
    return null;
  }
}

const parsedPostgresUrl = parsePostgresUrl(process.env.DATABASE_URL);
const parsedRedisUrl = parseRedisUrl(process.env.REDIS_URL);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  freePlanQuota: Number(process.env.FREE_PLAN_URL_QUOTA || 100),
  proPlanQuota: Number(process.env.PRO_PLAN_URL_QUOTA || 10000),
  postgres: {
    host: process.env.POSTGRES_HOST || parsedPostgresUrl?.host || "localhost",
    port: Number(process.env.POSTGRES_PORT || parsedPostgresUrl?.port || 5432),
    database: process.env.POSTGRES_DB || parsedPostgresUrl?.database || "url_shortener",
    user: process.env.POSTGRES_USER || parsedPostgresUrl?.user || "postgres",
    password: process.env.POSTGRES_PASSWORD || parsedPostgresUrl?.password || "postgres",
    max: Number(process.env.POSTGRES_MAX_POOL || 20)
  },
  redis: {
    host: process.env.REDIS_HOST || parsedRedisUrl?.host || "localhost",
    port: Number(process.env.REDIS_PORT || parsedRedisUrl?.port || 6379),
    password: process.env.REDIS_PASSWORD || parsedRedisUrl?.password || undefined,
    db: Number(process.env.REDIS_DB || parsedRedisUrl?.db || 0)
  },
  cacheDefaultTtlSeconds: Number(process.env.CACHE_DEFAULT_TTL_SECONDS || 86400),
  rateLimitPoints: Number(process.env.RATE_LIMIT_POINTS || 100),
  rateLimitDurationSeconds: Number(process.env.RATE_LIMIT_DURATION_SECONDS || 3600),
  analyticsQueueName: process.env.ANALYTICS_QUEUE_NAME || "analytics-events"
};

module.exports = env;
