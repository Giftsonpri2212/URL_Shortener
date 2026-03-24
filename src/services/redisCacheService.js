const env = require("../config/env");
const { redis } = require("../config/redis");
const { logError } = require("../config/logger");

const URL_CACHE_PREFIX = "short_url:";

function getUrlCacheKey(shortCode) {
  return `${URL_CACHE_PREFIX}${shortCode}`;
}

async function getOriginalUrl(shortCode) {
  try {
    const key = getUrlCacheKey(shortCode);
    const cachedValue = await redis.get(key);

    if (!cachedValue) {
      return null;
    }

    return JSON.parse(cachedValue);
  } catch (error) {
    logError("Redis get failed; continuing without cache", {
      message: error.message,
      shortCode
    });
    return null;
  }
}

async function setOriginalUrl(shortCode, payload, ttlSeconds = env.cacheDefaultTtlSeconds) {
  try {
    const key = getUrlCacheKey(shortCode);
    const value = JSON.stringify(payload);

    if (ttlSeconds > 0) {
      await redis.set(key, value, "EX", ttlSeconds);
      return;
    }

    await redis.set(key, value);
  } catch (error) {
    logError("Redis set failed; continuing without cache", {
      message: error.message,
      shortCode
    });
  }
}

async function deleteOriginalUrl(shortCode) {
  try {
    const key = getUrlCacheKey(shortCode);
    await redis.del(key);
  } catch (error) {
    logError("Redis delete failed; continuing without cache", {
      message: error.message,
      shortCode
    });
  }
}

module.exports = {
  getOriginalUrl,
  setOriginalUrl,
  deleteOriginalUrl
};
