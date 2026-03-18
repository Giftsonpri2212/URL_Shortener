const db = require("../config/db");

async function createUser({ email, passwordHash, planType }) {
  const query = `
    INSERT INTO users (email, password_hash, plan_type)
    VALUES ($1, $2, $3)
    RETURNING id, email, plan_type, created_at;
  `;

  const { rows } = await db.query(query, [email, passwordHash, planType]);
  return rows[0];
}

async function findByEmail(email) {
  const query = `
    SELECT id, email, password_hash, plan_type, created_at
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;

  const { rows } = await db.query(query, [email]);
  return rows[0] || null;
}

async function findById(id) {
  const query = `
    SELECT id, email, plan_type, created_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  findByEmail,
  findById
};
