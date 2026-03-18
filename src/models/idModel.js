const db = require("../config/db");

async function getNextUrlId() {
  const query = "SELECT nextval('short_urls_id_seq') AS id";
  const { rows } = await db.query(query);
  return Number(rows[0].id);
}

module.exports = {
  getNextUrlId
};
