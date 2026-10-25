
import { useEffect, useState } from "react";
import "./App.css";

// Har food ka card display karne wala component
function FoodCard({ food }) {
  return (
    <div className="food-card">

      {/* Filhaal food ke liye common emoji use kar rahe hain */}
      <div className="food-image">🍽️</div>

      {/* Database se aane wala food name */}
      <h3>{food.name}</h3>

      {/* Database se aane wali food price */}
      <p>Rs. {food.price}</p>

      {/* Cart functionality baad mein banayenge */}
      <button type="button">
        Add to Cart
      </button>

    </div>
  );
}

// Hamari application ka main component
function App() {

  // Database se aane wale foods store karenge
  const [foods, setFoods] = useState([]);

  // Loading status store karenge
  const [loading, setLoading] = useState(true);

  // API error ka message store karenge
  const [error, setError] = useState("");

  // Component mount hone par foods fetch karenge
  useEffect(() => {

    // API se data mangwane wala async function
    async function getFoods() {

      try {

        // Express backend ko GET request bhej rahe hain
        const response = await fetch(
          "http://localhost:5000/foods"
        );

        // Agar HTTP response successful nahi hai
        if (!response.ok) {
          throw new Error("Foods load nahi ho sake");
        }

        // JSON response ko JavaScript data mein convert kar rahe hain
        const data = await response.json();

        // API se aane wale foods state mein save kar rahe hain
        setFoods(data);

      } catch (err) {

        // Agar API request fail ho toh error save kar rahe hain
        setError(err.message);

      } finally {

        // Request complete hone par loading false kar rahe hain
        setLoading(false);

      }
    }

    // Upar banaya hua function call kar rahe hain
    getFoods();

  }, []);

  return (
    <div className="app">

      {/* Website ka navigation bar */}
      <header className="navbar">
        <h2>🍽️ Food Court</h2>
        <span>Home | Menu | Cart</span>
      </header>

      {/* Welcome section */}
      <section className="hero">
        <h1>Delicious Food Delivered to You</h1>
        <p>Order your favourite food online!</p>
      </section>

      {/* Food menu */}
      <section className="menu">

        <h2>Our Menu</h2>

        {/* Jab tak API response nahi aata */}
        {loading && <p>Loading foods...</p>}

        {/* Agar API request fail ho jaye */}
        {error && <p className="error">{error}</p>}

        {/* Agar database mein foods nahi hain */}
        {!loading && !error && foods.length === 0 && (
          <p>No foods available.</p>
        )}

        {/* Food cards display kar rahe hain */}
        {!loading && !error && (
          <div className="food-grid">

            {foods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
              />
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default App;
