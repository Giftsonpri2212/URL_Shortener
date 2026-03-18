const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userModel = require("../models/userModel");

async function authenticateJwt(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header"
      });
    }

    const token = authHeader.slice("Bearer ".length);
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await userModel.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found"
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      planType: user.plan_type
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token"
    });
  }
}

module.exports = {
  authenticateJwt
};
