
function Cart({ cart, onRemove, onIncrease, onDecrease }) {
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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
                    onClick={() => onDecrease(item.id)}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => onIncrease(item.id)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="remove-btn"
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
        </>
      )}
    </section>
  );
}

export default Cart;
