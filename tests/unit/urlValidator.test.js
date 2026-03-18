const { shortenUrlSchema } = require("../../src/utils/urlValidator");

describe("URL validation schema", () => {
  test("accepts a valid URL payload", () => {
    const result = shortenUrlSchema.safeParse({
      url: "https://example.com/very/long/url",
      customShortCode: "myCode123"
    });

    expect(result.success).toBe(true);
  });

  test("rejects an invalid URL", () => {
    const result = shortenUrlSchema.safeParse({
      url: "not-a-url"
    });

    expect(result.success).toBe(false);
  });

  test("rejects invalid custom short code", () => {
    const result = shortenUrlSchema.safeParse({
      url: "https://example.com",
      customShortCode: "bad code"
    });

    expect(result.success).toBe(false);
  });
});
