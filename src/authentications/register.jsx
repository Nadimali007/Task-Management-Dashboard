import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/input";
import { getUsers, registerUser } from "../services/authservices";
import "../css/register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "",
        rememberMe: false,
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError("");
                setSuccess("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.role) {
            setError("Please fill all fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const users = await getUsers();

            const existingUser = users.find((user) => user.email === formData.email);

            if (existingUser) {
                setError("Email already exists.");
                setLoading(false);
                return;
            }

            const newUser = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role,
                avatar: `https://i.pravatar.cc/150?u=${formData.email}`,
                department: "General",
                status: "Active",
                creatAt: new Date().toISOString().split('T')[0],
            };

            await registerUser(newUser);

            setSuccess("Registration successful! Redirecting to login...");

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                phone: "",
                role: "",
                rememberMe: false,
            });

            setTimeout(() => {
                navigate("/", {
                    state: {
                        registered: true,
                    },
                });
            }, 2000);
        } catch (err) {
            console.error(err);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Register for System</h2>

            <p>
                Please enter your registration information or{" "}
                <Link to="/">login</Link> if you already have an account.
            </p>

            <form onSubmit={handleSubmit}>
                <Input
                    label="Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name..."
                />

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email..."
                />

                <Input
                    label="Phone Number"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number..."
                />

                <Input
                    label="Role"
                    name="role"
                    type="dropdown"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Select role..."
                    options={["Employee", "Manager"]}
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password..."
                />

                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter password again..."
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {success && <p style={{ color: "lightgreen" }}>{success}</p>}
        </div>
    );
}

export default Register;