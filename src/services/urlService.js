const urlModel = require("../models/urlModel");
const { generateShortCodeFromSequence } = require("./idService");
const cacheService = require("./redisCacheService");

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

function getTtlSecondsFromExpiration(expiresAt) {
  if (!expiresAt) {
    return null;
  }

  const expiresAtDate = new Date(expiresAt);
  const now = new Date();
  const ttl = Math.floor((expiresAtDate.getTime() - now.getTime()) / 1000);
  return ttl > 0 ? ttl : 0;
}

function isExpired(expiresAt) {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= Date.now();
}

async function createShortUrl({ originalUrl, customShortCode, expiresAt, userId }) {
  const shortCode = customShortCode || (await generateShortCodeFromSequence()).shortCode;

  try {
    const created = await urlModel.createShortUrl({
      originalUrl,
      shortCode,
      expiresAt,
      userId
    });

    const ttl = getTtlSecondsFromExpiration(created.expires_at);
    await cacheService.setOriginalUrl(shortCode, {
      originalUrl: created.original_url,
      expiresAt: created.expires_at
    }, ttl === null ? undefined : ttl);

    return created;
  } catch (error) {
    if (error.code === "23505") {
      throw new ConflictError("Short code already exists. Try another custom short code.");
    }
    throw error;
  }
}

async function resolveShortCode(shortCode) {
  const cached = await cacheService.getOriginalUrl(shortCode);

  if (cached) {
    if (isExpired(cached.expiresAt)) {
      await cacheService.deleteOriginalUrl(shortCode);
      throw new NotFoundError("Short URL expired or not found");
    }

    return {
      originalUrl: cached.originalUrl,
      source: "cache"
    };
  }

  const urlRecord = await urlModel.findByShortCode(shortCode);
  if (!urlRecord || isExpired(urlRecord.expires_at)) {
    throw new NotFoundError("Short URL expired or not found");
  }

  const ttl = getTtlSecondsFromExpiration(urlRecord.expires_at);
  await cacheService.setOriginalUrl(shortCode, {
    originalUrl: urlRecord.original_url,
    expiresAt: urlRecord.expires_at
  }, ttl === null ? undefined : ttl);

  return {
    originalUrl: urlRecord.original_url,
    source: "database"
  };
}

module.exports = {
  createShortUrl,
  resolveShortCode,
  ConflictError,
  NotFoundError
};
