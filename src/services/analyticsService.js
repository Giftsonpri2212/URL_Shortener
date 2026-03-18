const analyticsModel = require("../models/analyticsModel");

async function getShortCodeAnalytics(shortCode) {
  const [totalClicks, clicksByDate, topCountries, deviceTypes] = await Promise.all([
    analyticsModel.getTotalClicks(shortCode),
    analyticsModel.getClicksByDate(shortCode),
    analyticsModel.getTopCountries(shortCode),
    analyticsModel.getDeviceTypes(shortCode)
  ]);

  return {
    shortCode,
    totalClicks,
    clicksByDate,
    topCountries,
    deviceTypes
  };
}

module.exports = {
  getShortCodeAnalytics
};
