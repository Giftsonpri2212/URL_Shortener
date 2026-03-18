const analyticsService = require("../services/analyticsService");

async function getAnalytics(req, res, next) {
  try {
    const { shortCode } = req.params;
    const analytics = await analyticsService.getShortCodeAnalytics(shortCode);
    return res.status(200).json(analytics);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAnalytics
};
