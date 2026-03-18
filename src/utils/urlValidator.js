const { z } = require("zod");

const shortenUrlSchema = z.object({
  url: z.string().url(),
  customShortCode: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{4,32}$/)
    .optional(),
  expiresAt: z.string().datetime().optional()
});

module.exports = {
  shortenUrlSchema
};
