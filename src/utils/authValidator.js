const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  planType: z.enum(["free", "pro"]).optional()
});

const loginSchema = z.object({
  email: z.string().email().max(320),
  // Login should only require a non-empty password; credential strength is enforced at registration time.
  password: z.string().min(1).max(128)
});

module.exports = {
  registerSchema,
  loginSchema
};
