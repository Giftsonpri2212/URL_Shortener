const express = require("express");
const { authenticateJwt } = require("../middlewares/authenticateJwt");
const { getMyLinks } = require("../controllers/userController");

const router = express.Router();

router.get("/my-links", authenticateJwt, getMyLinks);

module.exports = router;
