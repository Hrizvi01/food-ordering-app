
import "./App.css";

// Filhaal food items manually array mein rakhe hain
// Agle lesson mein PostgreSQL API se data laayenge
const foods = [
  {
    id: 1,
    name: "Chicken Burger",
    price: 500,
    emoji: "🍔"
  },
  {
    id: 2,
    name: "Cheese Pizza",
    price: 1200,
    emoji: "🍕"
  },
  {
    id: 3,
    name: "French Fries",
    price: 250,
    emoji: "🍟"
  }
];

// Har food item ka card banane wala component
function FoodCard({ food }) {

  return (
    <div className="food-card">

      {/* Food ki emoji show kar rahe hain */}
      <div className="food-image">
        {food.emoji}
      </div>

      {/* Food ka naam show kar rahe hain */}
      <h3>{food.name}</h3>

      {/* Food ki price show kar rahe hain */}
      <p>Rs. {food.price}</p>

      {/* Yeh button filhaal sirf design ke liye hai */}
      <button type="button">
        Add to Cart
      </button>

    </div>
  );
}

// Hamari application ka main component
function App() {

  return (
    <div className="app">

      {/* Website ka top navigation bar */}
      <header className="navbar">
        <h2>🍽️ Food Court</h2>
        <span>Home | Menu | Cart</span>
      </header>

      {/* Website ka welcome section */}
      <section className="hero">
        <h1>Delicious Food Delivered to You</h1>
        <p>
          Apna favourite food order karo!
        </p>
      </section>

      {/* Food menu section */}
      <section className="menu">

        <h2>Our Menu</h2>

        <div className="food-grid">

          {/* Array ke har food ke liye card bana rahe hain */}
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}

        </div>

      </section>

    </div>
  );
}

export default App;
