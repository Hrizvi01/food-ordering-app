
import { useState } from "react";

function Cart({
  cart,
  onRemove,
  onIncrease,
  onDecrease,
  onOrderPlaced
}) {
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");

  // Cart ki total price calculate kar rahe hain
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  async function handlePlaceOrder() {
    if (cart.length === 0 || placing) return;

    setPlacing(true);
    setMessage("");

    try {
      // Login token read kar rahe hain
      const token = localStorage.getItem("authToken");

      // Sirf food ID aur quantity backend ko bhejenge
      const items = cart.map((item) => ({
        foodId: item.id,
        quantity: item.quantity
      }));

      // Backend ko naya order bhej rahe hain
      const response = await fetch(
        "http://localhost:5000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ items })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order failed");
      }

      // Successful order ke baad parent ko update karenge
      onOrderPlaced();

      setMessage(`Order #${data.order.id} placed successfully!`);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="cart-section">
      <h2>🛒 Your Cart ({totalItems})</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <h3>{item.name}</h3>
                <p>Rs. {Number(item.price).toFixed(2)} each</p>
                <strong>
                  Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                </strong>
              </div>

              <div className="cart-actions">
                <div className="quantity-controls">
                  <button
                    type="button"
                    disabled={placing}
                    onClick={() => onDecrease(item.id)}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    disabled={placing}
                    onClick={() => onIncrease(item.id)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="remove-btn"
                  disabled={placing}
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <h3>Total</h3>
            <h3>Rs. {total.toFixed(2)}</h3>
          </div>

          <button
            type="button"
            className="place-order-btn"
            disabled={placing}
            onClick={handlePlaceOrder}
          >
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </>
      )}

      {message && <p className="order-message">{message}</p>}
    </section>
  );
}

export default Cart;
