const { encodeBase62 } = require("../../src/utils/base62");

describe("Base62 encoding", () => {
  test("encodes 0 correctly", () => {
    expect(encodeBase62(0)).toBe("a");
  });

  test("encodes positive integers", () => {
    expect(encodeBase62(1)).toBe("b");
    expect(encodeBase62(61)).toBe("9");
    expect(encodeBase62(62)).toBe("ba");
    expect(encodeBase62(3843)).toBe("99");
  });

  test("throws for invalid inputs", () => {
    expect(() => encodeBase62(-1)).toThrow("Input must be a non-negative integer");
    expect(() => encodeBase62(1.5)).toThrow("Input must be a non-negative integer");
  });
});
