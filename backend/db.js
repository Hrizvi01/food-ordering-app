
 // Environment variables ko .env file se load kar rahe hain
require("dotenv").config();

// PostgreSQL ki Pool class import kar rahe hain
const { Pool } = require("pg");

// Database ke saath connection pool create kar rahe hain
const pool = new Pool({
  // Database ka username
  user: process.env.DB_USER,

  // Database kis computer par chal raha hai
  host: process.env.DB_HOST,

  // Database ka naam
  database: process.env.DB_NAME,

  // Database ka password
  password: process.env.DB_PASSWORD,

  // PostgreSQL ka port number
  port: Number(process.env.DB_PORT),
});

// Pool ko export kar rahe hain taake server.js use kar sake
module.exports = pool;

