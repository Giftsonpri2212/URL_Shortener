const express = require("express");
const { authenticateJwt } = require("../middlewares/authenticateJwt");
const { getMyLinks, clearMyLinks } = require("../controllers/userController");

const router = express.Router();

router.get("/my-links", authenticateJwt, getMyLinks);
router.delete("/my-links", authenticateJwt, clearMyLinks);

module.exports = router;
