
import { useEffect, useState } from "react";

function OrderHistory({ refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        // Login token browser se le rahe hain
        const token = localStorage.getItem("authToken");

        // Backend se customer ke orders fetch karenge
        const response = await fetch(
          "http://localhost:5000/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Orders load nahi hue");
        }

        setOrders(data);

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

    loadOrders();

    return () => controller.abort();

  }, [refreshKey]);

  return (
    <section className="orders-section">
      <h2>📦 My Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>You have not placed any orders yet.</p>
      )}

      {!loading && !error && orders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-header">
            <h3>Order #{order.id}</h3>
            <span className="order-status">
              {order.status}
            </span>
          </div>

          <p>
            Date: {new Date(order.created_at).toLocaleString()}
          </p>

          {/* Order ke andar maujood foods */}
          {order.items.map((item, index) => (
            <p key={`${item.foodId}-${index}`}>
              {item.name || "Food unavailable"} × {item.quantity}
              {" — "}
              Rs. {(Number(item.price) * item.quantity).toFixed(2)}
            </p>
          ))}

          <h3>
            Total: Rs. {Number(order.total_amount).toFixed(2)}
          </h3>
        </div>
      ))}
    </section>
  );
}

export default OrderHistory;
