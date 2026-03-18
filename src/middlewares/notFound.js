function notFoundHandler(req, res) {
  return res.status(404).json({
    error: "NotFound",
    message: "Route not found"
  });
}

module.exports = {
  notFoundHandler
};
