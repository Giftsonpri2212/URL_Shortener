const env = require("../config/env");
const urlService = require("../services/urlService");
const quotaService = require("../services/quotaService");

async function shortenUrl(req, res, next) {
  try {
    console.log('[API] POST /api/shorten hit');
    console.log('[API] Request body:', req.validatedBody);

    const { url, customShortCode, expiresAt } = req.validatedBody;

    // Skip quota check if no user (JWT disabled for development)
    if (req.user && req.user.id) {
      await quotaService.ensureQuotaAvailable({
        userId: req.user.id,
        planType: req.user.planType
      });
    }

    const created = await urlService.createShortUrl({
      originalUrl: url,
      customShortCode,
      expiresAt,
      userId: req.user ? req.user.id : null
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
