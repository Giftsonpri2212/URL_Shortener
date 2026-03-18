const Redis = require("ioredis");
const env = require("./env");

const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  db: env.redis.db,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true
});

redis.on("error", (error) => {
  console.error("Redis connection error", error.message);
});

async function connectRedis() {
  if (redis.status === "ready" || redis.status === "connecting") {
    return;
  }

  await redis.connect();
}

module.exports = {
  redis,
  connectRedis
};
