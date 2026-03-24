jest.mock("../../src/config/env", () => {
  const actual = jest.requireActual("../../src/config/env");
  return {
    ...actual,
    nodeEnv: "production"
  };
});

const { buildShortenRateLimit } = require("../../src/middlewares/rateLimiter");

describe("shortenRateLimit middleware", () => {
  test("calls next when limiter allows request", async () => {
    const limiter = { consume: jest.fn().mockResolvedValue({}) };
    const middleware = buildShortenRateLimit(limiter);

    const req = { headers: {}, ip: "127.0.0.1", socket: { remoteAddress: "127.0.0.1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns 429 when limiter blocks request", async () => {
    const limiter = { consume: jest.fn().mockRejectedValue({ msBeforeNext: 2000 }) };
    const middleware = buildShortenRateLimit(limiter);

    const req = { headers: {}, ip: "127.0.0.1", socket: { remoteAddress: "127.0.0.1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
  });
});
