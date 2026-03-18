const UAParser = require("ua-parser-js");

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "0.0.0.0";
}

function parseDeviceType(userAgent) {
  const parser = new UAParser(userAgent || "");
  const deviceType = parser.getDevice().type;
  return deviceType || "desktop";
}

module.exports = {
  getClientIp,
  parseDeviceType
};
