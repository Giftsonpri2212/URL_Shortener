const env = require("../config/env");
const urlModel = require("../models/urlModel");
const cacheService = require("../services/redisCacheService");

async function getMyLinks(req, res, next) {
  try {
    const links = await urlModel.findByUserId(req.user.id);
    return res.status(200).json({
      userId: req.user.id,
      total: links.length,
      links: links.map((link) => ({
        id: link.id,
        shortCode: link.short_code,
        shortUrl: `${env.baseUrl}/${link.short_code}`,
        originalUrl: link.original_url,
        clickCount: Number(link.click_count),
        expiresAt: link.expires_at,
        createdAt: link.created_at
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function clearMyLinks(req, res, next) {
  try {
    const deletedRows = await urlModel.deleteByUserId(req.user.id);

    await Promise.all(
      deletedRows.map((row) => cacheService.deleteOriginalUrl(row.short_code))
    );

    return res.status(200).json({
      userId: req.user.id,
      deleted: deletedRows.length,
      message: "All links cleared successfully"
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMyLinks,
  clearMyLinks
};
