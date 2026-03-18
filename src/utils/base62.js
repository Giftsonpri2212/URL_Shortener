const BASE62_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BASE = BASE62_ALPHABET.length;

function encodeBase62(input) {
  if (!Number.isInteger(input) || input < 0) {
    throw new Error("Input must be a non-negative integer");
  }

  if (input === 0) {
    return BASE62_ALPHABET[0];
  }

  let value = input;
  let encoded = "";

  while (value > 0) {
    const remainder = value % BASE;
    encoded = BASE62_ALPHABET[remainder] + encoded;
    value = Math.floor(value / BASE);
  }

  return encoded;
}

module.exports = {
  encodeBase62,
  BASE62_ALPHABET
};
