const fs = require("fs");
const path = require("path");
const db = require("../src/config/db");

async function applySchema() {
  const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  try {
    await db.query(schema);
    console.log("Schema applied successfully");
  } catch (error) {
    console.error("Failed to apply schema", error);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

applySchema();
