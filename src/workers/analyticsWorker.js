const IORedis = require("ioredis");
const { Worker } = require("bullmq");
const env = require("../config/env");
const analyticsModel = require("../models/analyticsModel");
const urlModel = require("../models/urlModel");
const db = require("../config/db");
const { parseDeviceType } = require("../utils/requestMeta");

const workerConnection = new IORedis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  db: env.redis.db,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

const worker = new Worker(
  env.analyticsQueueName,
  async (job) => {
    const { shortCode, timestamp, ipAddress, userAgent } = job.data;
    const deviceType = parseDeviceType(userAgent || "unknown");

    await analyticsModel.createClickEvent({
      shortCode,
      timestamp,
      ipAddress,
      userAgent,
      country: null,
      deviceType
    });

    await urlModel.incrementClickCount(shortCode);
  },
  {
    connection: workerConnection,
    concurrency: 50
  }
);

worker.on("ready", () => {
  console.log("Analytics worker is ready");
});

worker.on("failed", (job, error) => {
  console.error("Analytics job failed", {
    jobId: job ? job.id : null,
    error: error.message
  });
});

worker.on("error", (error) => {
  console.error("Analytics worker error", error);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down analytics worker...`);
  await worker.close();
  await workerConnection.quit();
  await db.pool.end();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
