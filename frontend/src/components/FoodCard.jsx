
function FoodCard({ food, onViewDetails, onAddToCart }) {

  return (
    <div className="food-card">

      <div className="food-image">🍽️</div>

      <h3>{food.name}</h3>

      <p>Rs. {food.price}</p>

      {/* Food ki details open karne wala button */}
      <button
        type="button"
        onClick={() => onViewDetails(food.id)}
      >
        View Details
      </button>

      {/* Food ko cart mein add karne wala button */}
      <button
        type="button"
        onClick={() => onAddToCart(food)}
      >
        Add to Cart
      </button>

    </div>
  );
}

export default FoodCard;
