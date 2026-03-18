const { getClientIp } = require("../utils/requestMeta");
const { enqueueClickAnalytics } = require("../services/analyticsQueueService");

async function trackClick(req, shortCode) {
  const ipAddress = getClientIp(req);
  const userAgent = req.get("user-agent") || "unknown";

  await enqueueClickAnalytics({
    shortCode,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent
  });
}

module.exports = {
  trackClick
};
