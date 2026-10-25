
import { useEffect, useState } from "react";

function CurrencyConverter() {
  // Exchange rate store karne ke liye state
  const [rate, setRate] = useState(null);

  // User jitne PKR convert karna chahe
  const [amount, setAmount] = useState(1000);

  // Loading aur error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function getExchangeRate() {
      try {
        setLoading(true);
        setError("");

        // External API se PKR ka exchange rate le rahe hain
        const response = await fetch(
          "https://open.er-api.com/v6/latest/PKR",
          { signal: controller.signal }
        );

        // Agar API response successful nahi hai
        if (!response.ok) {
          throw new Error("Exchange rate load nahi hua");
        }

        // API response ko JavaScript object mein convert kar rahe hain
        const data = await response.json();

        // USD rate check kar rahe hain
        if (
          data.result !== "success" ||
          typeof data.rates?.USD !== "number"
        ) {
          throw new Error("USD rate available nahi hai");
        }

        // PKR se USD conversion rate save kar rahe hain
        setRate(data.rates.USD);

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

    getExchangeRate();

    // Component band hone par request cancel karenge
    return () => controller.abort();
  }, []);

  // Amount aur rate ko multiply karke USD calculate kar rahe hain
  const convertedAmount =
    rate !== null ? Number(amount) * rate : null;

  return (
    <section className="currency-converter">
      <h2>💱 Currency Converter</h2>

      <p>Convert Pakistani Rupees into US Dollars.</p>

      <label htmlFor="pkr-amount">Amount in PKR</label>

      <input
        id="pkr-amount"
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {loading && <p>Loading exchange rate...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && rate !== null && (
        <>
          <h3>
            ${convertedAmount.toFixed(2)} USD
          </h3>

          <p>
            1 PKR = {rate.toFixed(6)} USD
          </p>
        </>
      )}
    </section>
  );
}

export default CurrencyConverter;
