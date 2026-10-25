
import { useState } from "react";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "signup" : "login";

      const body =
        mode === "signup"
          ? { name, email, password }
          : { email, password };

      const response = await fetch(
        `http://localhost:5000/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (mode === "signup") {
        setMode("login");
        setPassword("");
        setMessage("Account created! Please login.");
      } else {
        onLogin(data.user, data.token);
      }

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-container">
      <h2>
        {mode === "signup" ? "Create Account" : "Login"}
      </h2>

      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={password}
          minLength={mode === "signup" ? 8 : undefined}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "signup"
            ? "Sign Up"
            : "Login"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        {mode === "signup"
          ? "Already have an account?"
          : "Don't have an account?"}
      </p>

      <button
        type="button"
        className="auth-switch"
        onClick={() => {
          setMode(mode === "signup" ? "login" : "signup");
          setMessage("");
          setPassword("");
        }}
      >
        {mode === "signup" ? "Go to Login" : "Create Account"}
      </button>
    </section>
  );
}

export default Auth;
