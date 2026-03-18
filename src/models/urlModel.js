const db = require("../config/db");

async function createShortUrl({ originalUrl, shortCode, expiresAt, userId }) {
  const query = `
    INSERT INTO short_urls (original_url, short_code, expires_at, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, original_url, short_code, click_count, expires_at, created_at, user_id;
  `;

  const values = [originalUrl, shortCode, expiresAt || null, userId || null];
  const { rows } = await db.query(query, values);
  return rows[0];
}

async function findByShortCode(shortCode) {
  const query = `
    SELECT id, original_url, short_code, click_count, expires_at, created_at, user_id
    FROM short_urls
    WHERE short_code = $1
    LIMIT 1;
  `;

  const { rows } = await db.query(query, [shortCode]);
  return rows[0] || null;
}

async function incrementClickCount(shortCode) {
  const query = `
    UPDATE short_urls
    SET click_count = click_count + 1
    WHERE short_code = $1;
  `;

  await db.query(query, [shortCode]);
}

async function getShortCodeById(id) {
  const query = `
    SELECT short_code
    FROM short_urls
    WHERE id = $1
    LIMIT 1;
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
}

async function countByUserId(userId) {
  const query = `
    SELECT COUNT(*)::INT AS total
    FROM short_urls
    WHERE user_id = $1;
  `;

  const { rows } = await db.query(query, [userId]);
  return Number(rows[0].total || 0);
}

async function findByUserId(userId) {
  const query = `
    SELECT id, original_url, short_code, click_count, expires_at, created_at
    FROM short_urls
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  const { rows } = await db.query(query, [userId]);
  return rows;
}

module.exports = {
  createShortUrl,
  findByShortCode,
  incrementClickCount,
  getShortCodeById,
  countByUserId,
  findByUserId
};
