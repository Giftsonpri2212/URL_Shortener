const db = require("../config/db");

async function createClickEvent({ shortCode, timestamp, ipAddress, userAgent, country, deviceType }) {
  const query = `
    INSERT INTO click_analytics (short_code, clicked_at, ip_address, user_agent, country, device_type)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  await db.query(query, [shortCode, timestamp || new Date().toISOString(), ipAddress, userAgent, country || null, deviceType || null]);
}

async function getTotalClicks(shortCode) {
  const query = `
    SELECT COUNT(*)::BIGINT AS total_clicks
    FROM click_analytics
    WHERE short_code = $1;
  `;

  const { rows } = await db.query(query, [shortCode]);
  return Number(rows[0].total_clicks || 0);
}

async function getClicksByDate(shortCode) {
  const query = `
    SELECT DATE(clicked_at) AS day, COUNT(*)::INT AS clicks
    FROM click_analytics
    WHERE short_code = $1
    GROUP BY DATE(clicked_at)
    ORDER BY DATE(clicked_at) DESC;
  `;

  const { rows } = await db.query(query, [shortCode]);
  return rows;
}

async function getTopCountries(shortCode, limit = 5) {
  const query = `
    SELECT COALESCE(country, 'unknown') AS country, COUNT(*)::INT AS clicks
    FROM click_analytics
    WHERE short_code = $1
    GROUP BY COALESCE(country, 'unknown')
    ORDER BY clicks DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query, [shortCode, limit]);
  return rows;
}

async function getDeviceTypes(shortCode) {
  const query = `
    SELECT COALESCE(device_type, 'unknown') AS device_type, COUNT(*)::INT AS clicks
    FROM click_analytics
    WHERE short_code = $1
    GROUP BY COALESCE(device_type, 'unknown')
    ORDER BY clicks DESC;
  `;

  const { rows } = await db.query(query, [shortCode]);
  return rows;
}

module.exports = {
  createClickEvent,
  getTotalClicks,
  getClicksByDate,
  getTopCountries,
  getDeviceTypes
};
