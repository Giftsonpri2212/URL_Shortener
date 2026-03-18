const app = require("./app");
const env = require("./config/env");
const db = require("./config/db");
const { connectRedis } = require("./config/redis");
const { logInfo, logError } = require("./config/logger");

async function startServer() {
  try {
    // await db.query("SELECT 1");  // disable database temporarily
    await connectRedis();

    app.listen(env.port, () => {
      logInfo("URL shortener server started", {
        port: env.port,
        nodeEnv: env.nodeEnv
      });
    });
  } catch (error) {
    console.error(error);
  }
}


startServer();
