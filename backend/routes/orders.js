
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Saari order APIs par login required hai
router.use(authMiddleware);


// ========================================
// POST /orders - NAYA ORDER PLACE KARNA
// ========================================

router.post("/", async (req, res) => {

  // Database transaction ke liye client
  let client;

  try {
    const { items } = req.body;

    // Cart empty ya invalid nahi hona chahiye
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Cart is empty"
      });
    }

    // Maximum 100 different foods allow kar rahe hain
    if (items.length > 100) {
      return res.status(400).json({
        error: "Too many items"
      });
    }

    // Har food ki ID aur quantity validate karenge
    const validItems = items.every((item) =>
      item &&
      Number.isSafeInteger(item.foodId) &&
      item.foodId > 0 &&
      Number.isSafeInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 100
    );

    if (!validItems) {
      return res.status(400).json({
        error: "Invalid cart items"
      });
    }

    // Duplicate food IDs allow nahi karenge
    const foodIds = items.map((item) => item.foodId);

    if (new Set(foodIds).size !== foodIds.length) {
      return res.status(400).json({
        error: "Duplicate food items"
      });
    }

    // Database connection le rahe hain
    client = await pool.connect();

    // Transaction start kar rahe hain
    await client.query("BEGIN");

    // Database se real food prices fetch karenge
    const foodsResult = await client.query(
      "SELECT id, price FROM foods WHERE id = ANY($1::int[])",
      [foodIds]
    );

    // Check karenge saare foods exist karte hain
    if (foodsResult.rows.length !== items.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Some foods are unavailable"
      });
    }

    // Food prices ko ID ke saath map kar rahe hain
    const foodPrices = new Map(
      foodsResult.rows.map((food) => [
        food.id,
        Number(food.price)
      ])
    );

    // Total price database ki prices se calculate karenge
    const total = items.reduce((sum, item) => {
      return sum +
        foodPrices.get(item.foodId) * item.quantity;
    }, 0);

    if (!Number.isFinite(total) || total < 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Invalid order total"
      });
    }

    // Orders table mein main order save kar rahe hain
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, status, total_amount, created_at`,
      [req.userId, "Pending", total.toFixed(2)]
    );

    const order = orderResult.rows[0];

    // Har food ko order_items table mein save karenge
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items
         (order_id, food_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [
          order.id,
          item.foodId,
          item.quantity,
          foodPrices.get(item.foodId)
        ]
      );
    }

    // Saara data successfully save hone par commit
    await client.query("COMMIT");

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {

    // Error par transaction undo karenge
    if (client) {
      await client.query("ROLLBACK").catch(console.error);
    }

    console.error(error);

    res.status(500).json({
      error: "Failed to place order"
    });

  } finally {

    // Database connection release karenge
    if (client) client.release();
  }
});


// ========================================
// GET /orders - APNE ORDERS DEKHNA
// ========================================

router.get("/", async (req, res) => {
  try {

    // Sirf logged-in customer ke orders fetch karenge
    const result = await pool.query(
      `SELECT
         o.id,
         o.status,
         o.total_amount,
         o.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'foodId', oi.food_id,
               'name', f.name,
               'quantity', oi.quantity,
               'price', oi.price
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN foods f ON f.id = oi.food_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.id DESC`,
      [req.userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load orders"
    });
  }
});

module.exports = router;
