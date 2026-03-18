const urlService = require("../services/urlService");
const { getClientIp } = require("../utils/requestMeta");
const { enqueueClickAnalytics } = require("../services/analyticsQueueService");

async function redirectToOriginalUrl(req, res, next) {
  try {
    const { shortCode } = req.params;
    const resolved = await urlService.resolveShortCode(shortCode);

    const analyticsPayload = {
      shortCode,
      timestamp: new Date().toISOString(),
      ipAddress: getClientIp(req),
      userAgent: req.get("user-agent") || "unknown"
    };

    // Do not block redirect if queue is temporarily unavailable.
    enqueueClickAnalytics(analyticsPayload).catch((error) => {
      console.error("Failed to enqueue analytics event", {
        shortCode,
        error: error.message
      });
    });

    return res.redirect(302, resolved.originalUrl);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  redirectToOriginalUrl
};
