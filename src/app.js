const path = require('path');
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const urlRoutes = require("./routes/urlRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const redirectRoutes = require("./routes/redirectRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFoundHandler } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.set("trust proxy", true);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "url-shortener",
    timestamp: new Date().toISOString()
  });
});

app.get("/test", (req, res) => {
  console.log('[API] GET /test hit');
  return res.status(200).json({ message: "API working" });
});

app.use("/auth", authRoutes);
app.use("/api", urlRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", userRoutes);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use("/", redirectRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
