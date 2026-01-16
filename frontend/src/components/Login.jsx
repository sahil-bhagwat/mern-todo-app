import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/addtask.css";

export default function Login() {
    const [userData, setUserData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const navigate = useNavigate();


    const validateForm = () => {
        if (!userData.email.trim()) {
            setError("Email is required");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            setError("Invalid email format");
            return false;
        }

        if (!userData.password.trim()) {
            setError("Password is required");
            return false;
        }

        if (userData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return false;
        }

        setError("");
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        const response = await fetch("http://localhost:3200/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (!result.success) {
            setError(result.msg || "Login failed");
            return;
        }

        // ^ Storing token safely
        localStorage.setItem("token", result.token);

        // ^ Storing user info from backend
        document.cookie="token="+result.token;

        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("login", result?.user?.email);
        window.dispatchEvent(new Event("localStorage-change"));

        // if (re/sponse.msg === "Login successful" || response.success === true)
        navigate("/");

    };

    return (
        <div className="container">
            <h1>Login</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <label>Email</label>
            <input
                type="email"
                placeholder="Enter email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            />

            <label>Password</label>
            <input
                type="password"
                placeholder="Enter password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            />

            <button onClick={handleLogin} className="submit">
                Login
            </button>

            <Link className="link" to="/signup">
                Create account
            </Link>
        </div>
    );
}
