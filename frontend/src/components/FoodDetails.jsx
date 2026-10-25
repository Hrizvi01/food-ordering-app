
 // Specific food ki details show karne wala component
function FoodDetails({ food, onBack }) {

  return (
    <section className="food-details">

      {/* Menu par wapas jaane wala button */}
      <button
        type="button"
        onClick={onBack}
      >
        ← Back to Menu
      </button>

      {/* Food ki information */}
      <div className="details-card">

        <div className="food-image">🍽️</div>

        {/* Database se aane wala naam */}
        <h2>{food.name}</h2>

        {/* Food ki unique ID */}
        <p>Food ID: {food.id}</p>

        {/* Food ki price */}
        <h3>Rs. {food.price}</h3>

        <p>Fresh and delicious food!</p>

      </div>

    </section>
  );
}

// Component export kar rahe hain
export default FoodDetails;
