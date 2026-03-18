const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userModel = require("../models/userModel");

class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      planType: user.plan_type
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function registerUser({ email, password, planType = "free" }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new AuthError("User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const created = await userModel.createUser({
    email,
    passwordHash,
    planType
  });

  const token = signToken(created);

  return {
    user: {
      id: created.id,
      email: created.email,
      planType: created.plan_type,
      createdAt: created.created_at
    },
    token
  };
}

async function loginUser({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthError("Invalid email or password", 401);
  }

  const token = signToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      planType: user.plan_type,
      createdAt: user.created_at
    },
    token
  };
}

module.exports = {
  registerUser,
  loginUser,
  AuthError
};
