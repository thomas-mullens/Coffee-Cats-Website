// server/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: "coffee_cats_01",
  host: "csce-315-db.engr.tamu.edu",
  database: "CSCE315Database",
  password: "coffee",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Export both the query function and the pool
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Export the pool directly
};