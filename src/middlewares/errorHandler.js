function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Unhandled error", err);
  }

  return res.status(statusCode).json({
    error: err.name || "InternalServerError",
    message: err.message || "Something went wrong"
  });
}

module.exports = {
  errorHandler
};
