import { useState } from "react";
import "../style/userProfile.css";

const UserProfile = ({ compact = true }) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const [name, setName] = useState(user?.name || "");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleUpdate = async () => {
        const payload = {};
        if (name.trim()) payload.name = name;
        if (password.trim()) payload.password = password;

        const res = await fetch("http://localhost:3200/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // ending cookie
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!data.success) {
            setMessage(data.msg || "Update failed");
            return;
        }

        // Update localStorage user name
        const updatedUser = { ...user, name };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setPassword("");
        setMessage("Profile updated successfully");
    };
    if (compact) {
        return (
            <div className="user-mini-profile">
                <div className="user-name">{user?.name}</div>
                <br />
                <div className="user-email">{user?.email}</div>
            </div>
        );
    }


    return (
        <div className={compact ? "user-mini-profile" : "container"}>
            <h2>User Profile</h2>

            <div className="profile-field">
                <label>Email</label>
                <input value={user?.email || ""} disabled />
            </div>

            <div className="profile-field">
                <label>Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="profile-field">
                <label>New Password</label>
                <input
                    type="password"
                    placeholder="Leave blank to keep same"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button onClick={handleUpdate} className="submit">
                Update Profile
            </button>

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default UserProfile;
