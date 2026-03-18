const env = require("../config/env");
const { redis } = require("../config/redis");

const URL_CACHE_PREFIX = "short_url:";

function getUrlCacheKey(shortCode) {
  return `${URL_CACHE_PREFIX}${shortCode}`;
}

async function getOriginalUrl(shortCode) {
  const key = getUrlCacheKey(shortCode);
  const cachedValue = await redis.get(key);

  if (!cachedValue) {
    return null;
  }

  return JSON.parse(cachedValue);
}

async function setOriginalUrl(shortCode, payload, ttlSeconds = env.cacheDefaultTtlSeconds) {
  const key = getUrlCacheKey(shortCode);
  const value = JSON.stringify(payload);

  if (ttlSeconds > 0) {
    await redis.set(key, value, "EX", ttlSeconds);
    return;
  }

  await redis.set(key, value);
}

async function deleteOriginalUrl(shortCode) {
  const key = getUrlCacheKey(shortCode);
  await redis.del(key);
}

module.exports = {
  getOriginalUrl,
  setOriginalUrl,
  deleteOriginalUrl
};
