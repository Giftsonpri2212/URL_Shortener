jest.mock("../../src/services/urlService", () => ({
  createShortUrl: jest.fn(),
  resolveShortCode: jest.fn()
}));

jest.mock("../../src/services/analyticsService", () => ({
  getShortCodeAnalytics: jest.fn()
}));

jest.mock("../../src/services/analyticsQueueService", () => ({
  enqueueClickAnalytics: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("../../src/services/quotaService", () => ({
  ensureQuotaAvailable: jest.fn().mockResolvedValue({
    planType: "free",
    quota: 100,
    used: 0,
    remaining: 100
  })
}));

jest.mock("../../src/middlewares/authenticateJwt", () => ({
  authenticateJwt: (req, res, next) => {
    req.user = { id: 1, email: "user@example.com", planType: "free" };
    next();
  }
}));

jest.mock("../../src/middlewares/rateLimiter", () => ({
  shortenRateLimit: (req, res, next) => next()
}));

const request = require("supertest");
const app = require("../../src/app");
const urlService = require("../../src/services/urlService");
const analyticsService = require("../../src/services/analyticsService");

describe("URL shortener API integration", () => {
  test("POST /api/shorten returns a short URL", async () => {
    urlService.createShortUrl.mockResolvedValue({
      id: 123,
      short_code: "abc",
      original_url: "https://example.com/very/long/url",
      click_count: 0,
      expires_at: null,
      created_at: new Date().toISOString(),
      user_id: 1
    });

    const response = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/very/long/url" });

    expect(response.status).toBe(201);
    expect(response.body.shortCode).toBe("abc");
  });

  test("GET /:shortCode redirects", async () => {
    urlService.resolveShortCode.mockResolvedValue({
      originalUrl: "https://example.com/target",
      source: "cache"
    });

    const response = await request(app).get("/abc");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("https://example.com/target");
  });

  test("GET /api/analytics/:shortCode returns analytics payload", async () => {
    analyticsService.getShortCodeAnalytics.mockResolvedValue({
      shortCode: "abc",
      totalClicks: 42,
      clicksByDate: [{ day: "2026-03-14", clicks: 10 }],
      topCountries: [{ country: "US", clicks: 30 }],
      deviceTypes: [{ device_type: "desktop", clicks: 25 }]
    });

    const response = await request(app).get("/api/analytics/abc");

    expect(response.status).toBe(200);
    expect(response.body.totalClicks).toBe(42);
  });
});
