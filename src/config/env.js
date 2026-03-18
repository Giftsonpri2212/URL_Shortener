const dotenv = require("dotenv");

dotenv.config();

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
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || "url_shortener",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    max: Number(process.env.POSTGRES_MAX_POOL || 20)
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0)
  },
  cacheDefaultTtlSeconds: Number(process.env.CACHE_DEFAULT_TTL_SECONDS || 86400),
  rateLimitPoints: Number(process.env.RATE_LIMIT_POINTS || 100),
  rateLimitDurationSeconds: Number(process.env.RATE_LIMIT_DURATION_SECONDS || 3600),
  analyticsQueueName: process.env.ANALYTICS_QUEUE_NAME || "analytics-events"
};

module.exports = env;
