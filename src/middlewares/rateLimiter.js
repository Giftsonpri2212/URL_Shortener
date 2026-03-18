const { RateLimiterRedis } = require("rate-limiter-flexible");
const env = require("../config/env");
const { redis } = require("../config/redis");
const { getClientIp } = require("../utils/requestMeta");

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rate_limit:shorten",
  points: env.rateLimitPoints,
  duration: env.rateLimitDurationSeconds
});

function buildShortenRateLimit(limiter) {
  return async function shortenRateLimit(req, res, next) {
    try {
      const ip = getClientIp(req);
      await limiter.consume(ip, 1);
      return next();
    } catch (error) {
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
