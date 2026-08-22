import { useState } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Please wait...");

    try {
      const url = isLogin ? "/api/login" : "/api/register";

      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      if (isLogin) {
        setLoggedInUser(data.user);
        setIsLoggedIn(true);
        setMessage("");
      } else {
        setMessage("Registration successful. Please login.");

        setName("");
        setEmail("");
        setPassword("");

        setIsLogin(true);
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  // Dashboard
  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="dashboard-card">
          <h1>Welcome! 🎉</h1>

          <h2>{loggedInUser?.name}</h2>

          <p>Email: {loggedInUser?.email}</p>

          <p className="success">
            Login successful!
          </p>

          <button
            onClick={() => {
              setIsLoggedIn(false);
              setLoggedInUser(null);
              setEmail("");
              setPassword("");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Login / Register
  return (
    <div className="app">
      <div className="auth-card">
        <h1>MERN stck- devopsApplication</h1>

        <p className="subtitle">
          {isLogin
            ? "Login to your account"
            : "Create your account"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {message && (
          <p className="message">{message}</p>
        )}

        <div className="switch">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsLogin(false);
                  setMessage("");
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
