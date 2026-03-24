const { Pool } = require("pg");
const env = require("./env");

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;


pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};
