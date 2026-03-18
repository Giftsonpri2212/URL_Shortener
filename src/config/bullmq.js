const IORedis = require("ioredis");
const { Queue } = require("bullmq");
const env = require("./env");

const bullConnection = new IORedis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  db: env.redis.db,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

const analyticsQueue = new Queue(env.analyticsQueueName, {
  connection: bullConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000
    },
    removeOnComplete: 1000,
    removeOnFail: 5000
  }
});

module.exports = {
  bullConnection,
  analyticsQueue
};
