
import { useEffect, useState } from "react";
import "./App.css";

// Har food item ka card display karne wala component
function FoodCard({ food }) {
  return (
    <div className="food-card">

      {/* Food ke liye filhaal common emoji */}
      <div className="food-image">🍽️</div>

      {/* Database se aane wala food name */}
      <h3>{food.name}</h3>

      {/* Database se aane wali price */}
      <p>Rs. {food.price}</p>

      {/* Cart functionality future lesson mein banayenge */}
      <button type="button">Add to Cart</button>

    </div>
  );
}

// Hamari application ka main component
function App() {

  // Backend se aane wale foods store karenge
  const [foods, setFoods] = useState([]);

  // Search box mein user jo likhega woh store hoga
  const [search, setSearch] = useState("");

  // API loading status
  const [loading, setLoading] = useState(true);

  // API error message
  const [error, setError] = useState("");

  // Search change hone par API se foods fetch karenge
  useEffect(() => {

    // Purani request cancel karne ke liye controller
    const controller = new AbortController();

    // Backend se food items mangwane wala function
    async function getFoods() {

      // Nayi request shuru hone par loading true
      setLoading(true);

      // Purana error clear kar rahe hain
      setError("");

      try {

        // Search text ko URL ke liye safely encode kar rahe hain
        const searchText = encodeURIComponent(search);

        // Search parameter ke saath API URL bana rahe hain
        const url = `http://localhost:5000/foods?search=${searchText}`;

        // Backend ko GET request bhej rahe hain
        const response = await fetch(url, {
          signal: controller.signal
        });

        // Agar server ne error status diya
        if (!response.ok) {
          throw new Error("Foods load nahi ho sake");
        }

        // JSON ko JavaScript data mein convert kar rahe hain
        const data = await response.json();

        // Foods ko React state mein save kar rahe hain
        setFoods(data);

      } catch (err) {

        // Cancel hui request ko error nahi samjhenge
        if (err.name !== "AbortError") {
          setError(err.message);
        }

      } finally {

        // Sirf active request ki loading end kar rahe hain
        if (!controller.signal.aborted) {
          setLoading(false);
        }

      }
    }

    // API function call kar rahe hain
    getFoods();

    // Search badalne par purani request cancel hogi
    return () => controller.abort();

  }, [search]);

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

      {/* Food menu section */}
      <section className="menu">

        <h2>Our Menu</h2>

        {/* Search input field */}
        <input
          type="text"
          className="search-input"
          placeholder="Search food..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {/* API request ke dauran loading message */}
        {loading && <p>Searching foods...</p>}

        {/* Agar request fail ho jaye */}
        {error && <p className="error">{error}</p>}

        {/* Agar koi matching food na mile */}
        {!loading && !error && foods.length === 0 && (
          <p>No foods found.</p>
        )}

        {/* Database se aane wale food cards */}
        {!loading && !error && (
          <div className="food-grid">

            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default App;
