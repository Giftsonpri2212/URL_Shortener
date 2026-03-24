const express = require("express");
const { shortenUrl } = require("../controllers/urlController");
const { validateBody } = require("../middlewares/validateRequest");
const { shortenRateLimit } = require("../middlewares/rateLimiter");
const { authenticateJwt } = require("../middlewares/authenticateJwt");
const { shortenUrlSchema } = require("../utils/urlValidator");

const router = express.Router();

router.post("/shorten", authenticateJwt, shortenRateLimit, validateBody(shortenUrlSchema), shortenUrl);

module.exports = router;
