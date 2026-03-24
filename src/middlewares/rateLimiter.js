const { RateLimiterRedis } = require("rate-limiter-flexible");
const env = require("../config/env");
const { redis } = require("../config/redis");
const { logError } = require("../config/logger");
const { getClientIp } = require("../utils/requestMeta");

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rate_limit:shorten",
  points: env.rateLimitPoints,
  duration: env.rateLimitDurationSeconds
});

function buildShortenRateLimit(limiter) {
  function isRateLimitRejection(error) {
    return Boolean(
      error &&
      (typeof error.msBeforeNext === "number" ||
      typeof error.remainingPoints === "number")
    );
  }

  return async function shortenRateLimit(req, res, next) {
    if (env.nodeEnv !== "production") {
      return next();
    }

    try {
      const ip = getClientIp(req);
      await limiter.consume(ip, 1);
      return next();
    } catch (error) {
      if (!isRateLimitRejection(error)) {
        logError("Rate limiter backend unavailable; skipping rate limit", {
          message: error.message,
          route: req.originalUrl
        });
        return next();
      }

      const retryAfter = Math.ceil((error.msBeforeNext || 60000) / 1000);
      return res.status(429).json({
        error: "TooManyRequests",
        message: "Rate limit exceeded. Try again later.",
        retryAfterSeconds: retryAfter
      });
    }
  };
}

const shortenRateLimit = buildShortenRateLimit(rateLimiter);

module.exports = {
  shortenRateLimit,
  buildShortenRateLimit
};
