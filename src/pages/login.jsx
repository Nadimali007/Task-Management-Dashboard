import  { useState } from "react";
import Input from "../components/input";
import { getUsers } from "../services/authservices";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
        
        setSuccess("Login successful!");
        setError("");
        console.log("Logged in user:", user);
        console.log("Remember Me:", formData.rememberMe);
      } else {
        setError("Invalid email or password");
        setSuccess("");
      }
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
      setSuccess("");
    }
    finally {
      setLoading(false);
    }
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

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default Login;