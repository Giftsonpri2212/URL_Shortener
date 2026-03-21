const express = require("express");
const { shortenUrl } = require("../controllers/urlController");
const { validateBody } = require("../middlewares/validateRequest");
const { shortenRateLimit } = require("../middlewares/rateLimiter");
const { authenticateJwt } = require("../middlewares/authenticateJwt");
const { shortenUrlSchema } = require("../utils/urlValidator");

const router = express.Router();

router.post("/shorten", /* authenticateJwt, */ shortenRateLimit, validateBody(shortenUrlSchema), shortenUrl); // JWT temporarily disabled for development

// Test route without auth
router.post("/shorten-test", validateBody(shortenUrlSchema), async (req, res, next) => {
  try {
    console.log('[API] POST /api/shorten-test hit');
    console.log('[API] Request body:', req.validatedBody);

    const { url, customShortCode, expiresAt } = req.validatedBody;

    // Skip quota check for test
    const created = await require("../services/urlService").createShortUrl({
      originalUrl: url,
      customShortCode,
      expiresAt,
      userId: null // No user for test
    });

    const response = {
      shortUrl: `${require("../config/env").baseUrl}/${created.short_code}`
    };

    console.log('[API] Response:', response);

    return res.status(201).json(response);
  } catch (error) {
    console.error('[API] Error in shorten-test:', error.message);
    return next(error);
  }
});

module.exports = router;
