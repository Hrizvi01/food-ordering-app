
 // Express import kar rahe hain taake server bana sakein
const express = require("express");

// CORS import kar rahe hain taake frontend request bhej sake
const cors = require("cors");

// Database connection import kar rahe hain
const pool = require("./db");

// Express application create kar rahe hain
const app = express();

// Frontend se requests allow kar rahe hain
app.use(cors());

// JSON request bodies read karne ke liye middleware
app.use(express.json());

// Backend check karne ke liye pehli GET API
app.get("/", (req, res) => {
  res.json({ message: "Food Ordering API is running!" });
});

// Foods database se hasil karne ke liye GET API
app.get("/foods", async (req, res) => {
  try {
    // PostgreSQL se tamam food items mangwa rahe hain
    const result = await pool.query("SELECT * FROM foods");

    // Database ke records JSON mein browser ko bhej rahe hain
    res.json(result.rows);

  } catch (error) {
    // Agar database query fail ho toh error log kar rahe hain
    console.error("Database error:", error.message);

    // Browser ko server error response bhej rahe hain
    res.status(500).json({ error: "Foods load nahi ho sake" });
  }
});

// Server ka port .env se le rahe hain
const PORT = process.env.PORT || 5000;

// Backend server start kar rahe hain
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
