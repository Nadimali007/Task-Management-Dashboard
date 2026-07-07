import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { getUsers, resetPassword } from "../services/authservices";
import { ArrowRight, ClipboardList, Eye, EyeOff } from "lucide-react";
import "../css/login.css";
function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false, });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotLink, setShowForgotLink] = useState(false);
  const [forgotData, setForgotData] = useState({ password: "", confirmPassword: "", });
  const [hidepassword, sethidepassword] = useState(false);

  useEffect(() => {
    if (location.state?.registered) {
      setSuccess("Registration successful! Please login.");

      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }

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
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;

    setForgotData((prev) => ({
      ...prev,
      [name]: value,
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
          u.email.trim().toLowerCase() ===
          formData.email.trim().toLowerCase() &&
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
        setSuccess(`Login successful! Welcome ${user.name}.`);

        console.log(user);
        console.log(user.id);
        console.log(user.name);

        setTimeout(() => {
          navigate("/dashboard", {
            state: {
              registered: true,
              UserID: user.id,
              name: user.name,
            },
          });
        }, 2000);
      }
      else {
        setError("Invalid email or password");
        setShowForgotLink(true);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);

      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      forgotData.password.trim() !==
      forgotData.confirmPassword.trim()
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(
        formData.email,
        forgotData.password
      );
      setSuccess("Password updated successfully.");

      setForgotData({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowForgotPassword(false);
        setShowLoginForm(true);
        setShowForgotLink(false);
      }, 300);
    } catch (err) {
      setError(err.message || "Email not found.");
    }

    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);
  };

  const showhidepassword = () => {
    sethidepassword((prev) => !prev);
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {showLoginForm && (
          <>
            <div className="formtopimage"><ClipboardList /></div>
            <h4>TaskMasterPro</h4>

            <h3>ENTERPRISE SAAS WORKSPACE</h3>

            <form onSubmit={handleSubmit}>
              <label htmlFor="Email">Email</label>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email..."
              />
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <Input
                  id="password"
                  name="password"
                  type={hidepassword ? "password" : "text"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password..."
                  className="password-input"
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={showhidepassword}
                  aria-label={hidepassword ? "Show password" : "Hide password"}
                >
                  {hidepassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
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

              <button type="submit" disabled={loading} className="loginButton">
                {loading ? "Signing in..." : "Signin"}
                <ArrowRight className="Arrow" />
              </button>

              <Link to="/register" className="newaccountButton">
                New Account
              </Link>
            </form>


            {showForgotLink && (
              <p
                style={{
                  marginTop: "15px",
                  color: "#2563eb",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setShowLoginForm(false);

                  setTimeout(() => {
                    setShowForgotPassword(true);
                  }, 300);
                }}
              >
                Forgot Password?
              </p>
            )}
          </>
        )}

        {showForgotPassword && (
          <>
            <h2>Reset Password</h2>

            <form
              onSubmit={handleForgotPassword}
              className="forgot-password-form"
            >
              <Input
                label="Registered Email"
                type="email"
                value={formData.email}
                disabled
              />

              <Input
                label="New Password"
                name="password"
                type="password"
                value={forgotData.password}
                onChange={handleForgotChange}
                placeholder="Enter new password"
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={forgotData.confirmPassword}
                onChange={handleForgotChange}
                placeholder="Confirm new password"
              />

              <button type="submit" className="ResetPassowrdButton">
                Reset Password
              </button>
            </form>
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "lightgreen" }}>{success}</p>}

      </div>
    </div>
  );
}

export default Login;