const env = require("../config/env");
const urlService = require("../services/urlService");
const quotaService = require("../services/quotaService");

async function shortenUrl(req, res, next) {
  try {
    console.log('[API] POST /api/shorten hit');
    console.log('[API] Request body:', req.validatedBody);

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication is required to create short URLs"
      });
    }

    const { url, customShortCode, expiresAt } = req.validatedBody;

    await quotaService.ensureQuotaAvailable({
      userId: req.user.id,
      planType: req.user.planType
    });

    const created = await urlService.createShortUrl({
      originalUrl: url,
      customShortCode,
      expiresAt,
      userId: req.user.id
    });

    const response = {
      id: created.id,
      shortCode: created.short_code,
      shortUrl: `${env.baseUrl}/${created.short_code}`,
      originalUrl: created.original_url,
      clickCount: created.click_count,
      expiresAt: created.expires_at,
      createdAt: created.created_at,
      userId: created.user_id
    };

    console.log('[API] Response:', response);

    return res.status(201).json(response);
  } catch (error) {
    console.error('[API] Error in shortenUrl:', error.message);
    return next(error);
  }
}

module.exports = {
  shortenUrl
};
