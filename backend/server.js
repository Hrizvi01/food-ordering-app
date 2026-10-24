
 // Express ko import kar rahe hain taake backend server bana sakein
const express = require("express");

// CORS ko import kar rahe hain taake React frontend request bhej sake
const cors = require("cors");

// Express application create kar rahe hain
const app = express();

// Frontend se aane wali requests allow kar rahe hain
app.use(cors());

// JSON data read karne ke liye middleware laga rahe hain
app.use(express.json());

// Backend check karne ke liye simple GET API bana rahe hain
app.get("/", (req, res) => {
  res.json({ message: "Food Ordering API is running!" });
});

// Backend ke liye port number set kar rahe hain
const PORT = process.env.PORT || 5000;

// Server start kar rahe hain
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
