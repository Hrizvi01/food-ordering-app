
import { useEffect, useState } from "react";
import "./App.css";

import Cart from "./components/Cart";
import FoodCard from "./components/FoodCard";
import FoodDetails from "./components/FoodDetails";

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [cart, setCart] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function getFoods() {
      setLoading(true);
      setError("");

      try {
        const searchText = encodeURIComponent(search);

        const response = await fetch(
          `http://localhost:5000/foods?search=${searchText}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Foods load nahi ho sake");
        }

        const data = await response.json();
        setFoods(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    getFoods();

    return () => controller.abort();
  }, [search]);

  useEffect(() => {
    if (selectedFoodId === null) return;

    const controller = new AbortController();

    async function getFoodDetails() {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedFood(null);

      try {
        const response = await fetch(
          `http://localhost:5000/foods/${selectedFoodId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Food details load nahi ho sake");
        }

        const data = await response.json();
        setSelectedFood(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setDetailsError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    }

    getFoodDetails();

    return () => controller.abort();
  }, [selectedFoodId]);

  function handleViewDetails(foodId) {
    setSelectedFoodId(foodId);
  }

  function handleBack() {
    setSelectedFoodId(null);
    setSelectedFood(null);
    setDetailsError("");
  }

  function handleAddToCart(food) {
    setCart((previousCart) => {
      const existingFood = previousCart.find(
        (item) => item.id === food.id
      );

      if (existingFood) {
        return previousCart.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...food, quantity: 1 }];
    });
  }

  function handleIncrease(foodId) {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === foodId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function handleDecrease(foodId) {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === foodId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleRemoveFromCart(foodId) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== foodId)
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <h2>🍽️ Food Court</h2>
        <span>Home | Menu | Cart</span>
      </header>

      {selectedFoodId === null ? (
        <>
          <section className="hero">
            <h1>Delicious Food Delivered to You</h1>
            <p>Order your favourite food online!</p>
          </section>

          <section className="menu">
            <h2>Our Menu</h2>

            <input
              type="text"
              className="search-input"
              placeholder="Search food..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {loading && <p>Loading foods...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && foods.length === 0 && (
              <p>No foods found.</p>
            )}

            {!loading && !error && (
              <div className="food-grid">
                {foods.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {detailsLoading && (
            <p className="details-message">
              Loading food details...
            </p>
          )}

          {detailsError && (
            <div className="details-message">
              <p className="error">{detailsError}</p>
              <button type="button" onClick={handleBack}>
                Back to Menu
              </button>
            </div>
          )}

          {!detailsLoading && !detailsError && selectedFood && (
            <FoodDetails
              food={selectedFood}
              onBack={handleBack}
            />
          )}
        </>
      )}

      <Cart
        cart={cart}
        onRemove={handleRemoveFromCart}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
      />
    </div>
  );
}

export default App;
