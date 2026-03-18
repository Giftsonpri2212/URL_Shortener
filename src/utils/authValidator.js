const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  planType: z.enum(["free", "pro"]).optional()
});

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128)
});

module.exports = {
  registerSchema,
  loginSchema
};
