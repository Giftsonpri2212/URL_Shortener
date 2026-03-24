function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }));

      const message = details
        .map((detail) => `${detail.path || "field"}: ${detail.message}`)
        .join(", ");

      return res.status(400).json({
        error: "ValidationError",
        message: message || "Invalid request payload",
        details
      });
    }

    req.validatedBody = result.data;
    return next();
  };
}

module.exports = {
  validateBody
};
