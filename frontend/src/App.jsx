
import { useEffect, useState } from "react";
import "./App.css";

import Cart from "./components/Cart";
import FoodCard from "./components/FoodCard";
import FoodDetails from "./components/FoodDetails";
import Auth from "./components/Auth";
import OrderHistory from "./components/OrderHistory";

function App() {
  // Foods aur search ki states
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Food details ki states
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Login ki states
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Orders refresh karne ke liye counter
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  // Browser se saved cart load kar rahe hain
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("foodCart") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Cart update hone par localStorage mein save hoga
  useEffect(() => {
    localStorage.setItem("foodCart", JSON.stringify(cart));
  }, [cart]);

  // Saved token se login verify kar rahe hain
  useEffect(() => {
    const controller = new AbortController();

    async function checkLogin() {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          if (!controller.signal.aborted) {
            localStorage.removeItem("authToken");
            setUser(null);
          }
          return;
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setUser(data.user);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Login check failed:", err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAuthLoading(false);
        }
      }
    }

    checkLogin();
    return () => controller.abort();
  }, []);

  // Search change hone par foods fetch kar rahe hain
  useEffect(() => {
    const controller = new AbortController();

    async function getFoods() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:5000/foods?search=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Foods load nahi ho sake");
        }

        setFoods(await response.json());
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

  // Selected food ki details fetch kar rahe hain
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

        setSelectedFood(await response.json());
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

  // Login successful hone par token save karenge
  function handleLogin(loggedInUser, token) {
    localStorage.setItem("authToken", token);
    setUser(loggedInUser);
  }

  // Logout par token aur user clear karenge
  function handleLogout() {
    localStorage.removeItem("authToken");
    setUser(null);
    setCart([]);
    setSelectedFoodId(null);
    localStorage.removeItem("foodCart");
  }

  // Food details open karne ke liye
  function handleViewDetails(foodId) {
    setSelectedFoodId(foodId);
  }

  // Menu par wapas aane ke liye
  function handleBack() {
    setSelectedFoodId(null);
    setSelectedFood(null);
    setDetailsError("");
  }

  // Food ko cart mein add karne ke liye
  function handleAddToCart(food) {
    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === food.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...food, quantity: 1 }];
    });
  }

  // Quantity increase karne ke liye
  function handleIncrease(id) {
    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  // Quantity decrease karne ke liye
  function handleDecrease(id) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Cart se food remove karne ke liye
  function handleRemoveFromCart(id) {
    setCart((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  // Order successful hone par cart clear aur history refresh
  function handleOrderPlaced() {
    setCart([]);
    setOrdersRefreshKey((previous) => previous + 1);
  }

  return (
    <div className="app">

      <header className="navbar">
        <h2>🍽️ Food Court</h2>

        {user ? (
          <div className="navbar-user">
            <span>Welcome, {user.name}</span>

            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <span>Home | Menu | Account</span>
        )}
      </header>

      {authLoading ? (
        <p className="details-message">Checking login...</p>
      ) : !user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <>
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
                  onChange={(e) => setSearch(e.target.value)}
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

          {/* Customer ka shopping cart */}
          <Cart
            cart={cart}
            onRemove={handleRemoveFromCart}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onOrderPlaced={handleOrderPlaced}
          />

          {/* Customer ke previous orders */}
          <OrderHistory refreshKey={ordersRefreshKey} />
        </>
      )}
    </div>
  );
}

export default App;
