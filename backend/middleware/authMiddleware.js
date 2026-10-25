
const jwt = require("jsonwebtoken");

// User ka JWT token verify karne wala middleware
function authMiddleware(req, res, next) {
  try {
    // Frontend se authorization header read kar rahe hain
    const authorization = req.headers.authorization || "";

    // Header mein Bearer token hona chahiye
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Please login first"
      });
    }

    // JWT token verify kar rahe hain
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Verified user ki ID request mein save kar rahe hain
    req.userId = decoded.userId;

    // Request ko next function tak bhej rahe hain
    next();

  } catch (error) {
    // Invalid ya expired token reject karenge
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}

module.exports = authMiddleware;
