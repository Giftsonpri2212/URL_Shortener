jest.mock("../../src/models/urlModel", () => ({
  countByUserId: jest.fn()
}));

const urlModel = require("../../src/models/urlModel");
const {
  ensureQuotaAvailable,
  QuotaExceededError,
  getQuotaForPlan
} = require("../../src/services/quotaService");

describe("quotaService", () => {
  test("returns free plan quota", () => {
    expect(getQuotaForPlan("free")).toBeGreaterThan(0);
  });

  test("allows URL creation when under quota", async () => {
    urlModel.countByUserId.mockResolvedValue(10);

    const result = await ensureQuotaAvailable({
      userId: 1,
      planType: "free"
    });

    expect(result.used).toBe(10);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  test("throws when quota is exceeded", async () => {
    urlModel.countByUserId.mockResolvedValue(100);

    await expect(
      ensureQuotaAvailable({
        userId: 1,
        planType: "free"
      })
    ).rejects.toBeInstanceOf(QuotaExceededError);
  });
});
