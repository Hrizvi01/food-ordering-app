const authRoutes = require("./routes/auth");
// Orders ki APIs import kar rahe hain
const orderRoutes = require("./routes/orders");


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

 // Food items ko search karne ke liye GET API
app.get("/foods", async (req, res) => {

  try {

    // URL se search parameter hasil kar rahe hain
    const search = req.query.search || "";

    // Check kar rahe hain ke search text hai
    if (typeof search !== "string") {
      return res.status(400).json({
        error: "Invalid search value"
      });
    }

    // PostgreSQL se matching foods hasil kar rahe hain
    const result = await pool.query(
      "SELECT * FROM foods WHERE name ILIKE $1 ORDER BY id",
      [`%${search}%`]
    );

    // Matching food items JSON mein return kar rahe hain
    res.json(result.rows);

  } catch (error) {

    // Database error terminal mein show kar rahe hain
    console.error("Search error:", error.message);

    // Server error response bhej rahe hain
    res.status(500).json({
      error: "Foods load nahi ho sake"
    });

  }

});



 // Specific food ki ID receive karne ke liye GET API

 // Specific food item database se hasil karne ke liye GET API

 
 // Food items ko search aur price ke hisaab se filter karne wali API
app.get("/foods", async (req, res) => {

  try {

    // URL se search aur maxPrice hasil kar rahe hain
    const search = req.query.search || "";
    const maxPrice = req.query.maxPrice;

    // Search value ka type check kar rahe hain
    if (typeof search !== "string") {
      return res.status(400).json({
        error: "Invalid search value"
      });
    }

    // Pehle SQL query aur uski values prepare kar rahe hain
    let query = "SELECT * FROM foods WHERE name ILIKE $1";
    const values = [`%${search}%`];

    // Agar maxPrice di gayi hai toh price filter add karenge
    if (maxPrice !== undefined) {

      // Price ko number mein convert kar rahe hain
      const price = Number(maxPrice);

      // Check kar rahe hain ke price valid hai
      if (
        typeof maxPrice !== "string" ||
        maxPrice.trim() === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          error: "Invalid maximum price"
        });
      }

      // SQL query mein price ki condition add kar rahe hain
      query += " AND price <= $2";

      // Doosri SQL value mein maximum price rakh rahe hain
      values.push(price);
    }

    // Foods ko ID ke hisaab se arrange kar rahe hain
    query += " ORDER BY id";

    // PostgreSQL mein query execute kar rahe hain
    const result = await pool.query(query, values);

    // Matching food items return kar rahe hain
    res.json(result.rows);

  } catch (error) {

    // Error ki details terminal mein show kar rahe hain
    console.error("Filter error:", error.message);

    // Server error response bhej rahe hain
    res.status(500).json({
      error: "Foods load nahi ho sake"
    });

  }

});



 // Naya food item add karne ke liye POST API
app.post("/foods", async (req, res) => {

  try {

    // Request body se food ka naam aur price le rahe hain
    const { name, price } = req.body;

    // Check kar rahe hain ke naam sahi text hai
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        error: "Valid food name required"
      });
    }

    // Check kar rahe hain ke price positive number hai
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        error: "Valid price required"
      });
    }

    // PostgreSQL mein naya food insert kar rahe hain
    const result = await pool.query(
      "INSERT INTO foods (name, price) VALUES ($1, $2) RETURNING *",
      [name.trim(), price]
    );

    // Naya record successfully create hone par response bhej rahe hain
    res.status(201).json(result.rows[0]);

  } catch (error) {

    // Error ki details backend terminal mein show kar rahe hain
    console.error("Database error:", error.message);

    // Server error ka response bhej rahe hain
    res.status(500).json({
      error: "Food add nahi ho saka"
    });

  }

});




 // Existing food item ko update karne ke liye PUT API
app.put("/foods/:id", async (req, res) => {

  try {

    // URL se food ki ID number mein convert kar rahe hain
    const foodId = Number(req.params.id);

    // Request body se naya naam aur price le rahe hain
    const { name, price } = req.body;

    // Check kar rahe hain ke food ID valid hai
    if (!Number.isSafeInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        error: "Invalid food ID"
      });
    }

    // Check kar rahe hain ke naam sahi text hai
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        error: "Valid food name required"
      });
    }

    // Check kar rahe hain ke price positive number hai
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        error: "Valid price required"
      });
    }

    // PostgreSQL mein matching food update kar rahe hain
    const result = await pool.query(
      "UPDATE foods SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name.trim(), price, foodId]
    );

    // Agar matching food nahi mila toh 404 bhej rahe hain
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Food not found"
      });
    }

    // Updated food item response mein bhej rahe hain
    res.json(result.rows[0]);

  } catch (error) {

    // Error terminal mein show kar rahe hain
    console.error("Update error:", error.message);

    // Server error ka response bhej rahe hain
    res.status(500).json({
      error: "Food update nahi ho saka"
    });

  }

});


 // Existing food item delete karne ke liye DELETE API
app.delete("/foods/:id", async (req, res) => {

  try {

    // URL se food ki ID number mein convert kar rahe hain
    const foodId = Number(req.params.id);

    // Check kar rahe hain ke ID valid hai
    if (!Number.isSafeInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        error: "Invalid food ID"
      });
    }

    // PostgreSQL se matching food delete kar rahe hain
    const result = await pool.query(
      "DELETE FROM foods WHERE id = $1 RETURNING *",
      [foodId]
    );

    // Agar matching food nahi mila toh 404 bhej rahe hain
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Food not found"
      });
    }

    // Successfully deleted food ka response bhej rahe hain
    res.json({
      message: "Food deleted successfully",
      food: result.rows[0]
    });

  } catch (error) {

    // Database error terminal mein show kar rahe hain
    console.error("Delete error:", error.message);

    // Server error ka response bhej rahe hain
    res.status(500).json({
      error: "Food delete nahi ho saka"
    });

  }

});

// Ek specific food ko ID se fetch karne ke liye API
app.get("/foods/:id", async (req, res) => {
  try {

    // URL se food ki ID nikal rahe hain
    const foodId = Number(req.params.id);

    // Check kar rahe hain ke ID valid hai
    if (!Number.isSafeInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        error: "Invalid food ID"
      });
    }

    // PostgreSQL se specific food fetch kar rahe hain
    const result = await pool.query(
      "SELECT * FROM foods WHERE id = $1",
      [foodId]
    );

    // Agar food database mein exist nahi karta
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Food not found"
      });
    }

    // Food ki details frontend ko send kar rahe hain
    res.json(result.rows[0]);

  } catch (error) {

    // Agar database ya server mein problem aaye
    console.error(error.message);

    res.status(500).json({
      error: "Server error"
    });
  }
});

// Server ka port .env se le rahe hain
const PORT = process.env.PORT || 5000;

app.use("/auth", authRoutes);
// /orders URLs ko orders router handle karega
app.use("/orders", orderRoutes);

// Backend server start kar rahe hain
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
