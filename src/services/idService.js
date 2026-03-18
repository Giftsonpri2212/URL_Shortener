const idModel = require("../models/idModel");
const { encodeBase62 } = require("../utils/base62");

async function generateShortCodeFromSequence() {
  const nextId = await idModel.getNextUrlId();
  return {
    numericId: nextId,
    shortCode: encodeBase62(nextId)
  };
}

module.exports = {
  generateShortCodeFromSequence
};
