import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/addtask.css";

export default function SignUp() {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();


    const validateForm = () => {
        const { name, email, password } = userData;
        const newErrors = {};

        if (!name.trim()) newErrors.name = "Name is required";

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Invalid email";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Minimum 8 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (localStorage.getItem("token")) {
            navigate("/");
        }
        if (!validateForm()) return;

        try {
            const response = await fetch("http://localhost:3200/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                alert(result.msg || "Signup failed");
                return;
            }

            if (!response.su || result.msg === 'User already exists') {
                alert(result.msg || "Wrong Credentials");
                return;
            }

            if (response.ok && (response.success && response.msg === 'Signup successful')) {
                alert("Signup successful. Please login.");
                navigate("/login");
            }


        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    };

    return (
        <div className="container">
            <h1>Sign Up</h1>

            <label>Name</label>
            <input
                value={userData.name}
                onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                }
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <label>Email</label>
            <input
                value={userData.email}
                onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                }
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <label>Password</label>
            <input
                type="password"
                value={userData.password}
                onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                }
            />
            {errors.password && <p className="error">{errors.password}</p>}

            <button onClick={handleSignUp} className="submit">
                Sign Up
            </button>

            <Link className="link" to="/login">
                Login
            </Link>
        </div>
    );
}
