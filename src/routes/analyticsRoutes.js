const express = require("express");
const { getAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/analytics/:shortCode", getAnalytics);

module.exports = router;
