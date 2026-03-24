const app = require("./app");
const env = require("./config/env");
const db = require("./config/db");
const { connectRedis } = require("./config/redis");
const { logInfo, logError } = require("./config/logger");

async function startServer() {
  try {
    // await db.query("SELECT 1");  // disable database temporarily
    try {
      await connectRedis();
    } catch (error) {
      logError("Redis not available; starting API in degraded mode", {
        message: error.message
      });
    }

    const PORT = process.env.PORT || env.port || 3000;

app.listen(PORT, () => {
  logInfo("URL shortener server started", {
    port: PORT,
    nodeEnv: env.nodeEnv
  });
});

  } catch (error) {
    console.error(error);
  }
}


startServer();
