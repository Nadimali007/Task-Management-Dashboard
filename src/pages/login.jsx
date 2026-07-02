import { useState, useEffect } from "react";
import Input from "../components/input";
import { getUsers } from "../services/authservices";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (storedUser) {
      setLoggedInUser(storedUser);
      setSuccess(`Welcome back, ${storedUser.email}`);

      setFormData((prev) => ({
        ...prev,
        email: storedUser.email,
        rememberMe: !!localStorage.getItem("user"),
      }));
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);

  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const users = await getUsers();

      const user = users.find(
        (u) =>
          u.email === formData.email &&
          u.password === formData.password
      );

      if (user) {

        localStorage.removeItem("user");
        sessionStorage.removeItem("user");

        if (formData.rememberMe) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
        }

        setLoggedInUser(user);
        setSuccess("Login successful!");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    setLoggedInUser(null);

    setFormData({
      email: "",
      password: "",
      rememberMe: false,
    });

    setSuccess("");
    setError("");
  };

  return (
    <div className="login-container">
      <h2>Login to System</h2>

      <p>
        Please enter your login information or{" "}
        <a href="/register">register</a> if you don't have an account.
      </p>

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
        />

        <div className="remember-me">
          <input
            id="rememberMe"
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />

          <label htmlFor="rememberMe">Remember Me</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {
        loggedInUser ? (
          <button
            style={{ marginTop: "15px" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : null
      }
      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      {success ? <p style={{ color: "white" }}>{success}</p> : null}

    </div>
  );
}

export default Login;