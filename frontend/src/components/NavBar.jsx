import { Link } from "react-router-dom";
import "../style/navbar.css";
import { useEffect, useState } from "react";
import UserProfile from "./UserProfile";

function NavBar() {
    const [login, setLogin] = useState(localStorage.getItem("login"));
    const [showProfile, setShowProfile] = useState(false);

    const logout = () => {
        localStorage.removeItem("login");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authChanged"));
        window.location.replace("/login");
    };

    useEffect(() => {
        const updateAuth = () => {
            setLogin(localStorage.getItem("login"));
        };

        window.addEventListener("localStorage-change", updateAuth);

        return () => window.removeEventListener("localStorage-change", updateAuth);
    }, []);

    return (
        <nav className="navbar">
            <div className="logo">To Do App</div>

            {login && (
                <div className="nav-right">
                    <ul className="nav-links">
                        <li>
                            <Link to="/">List</Link>
                        </li>
                        <li>
                            <Link to="/add">Add Task</Link>
                        </li>
                        <li>
                            <Link onClick={logout}>Logout</Link>
                        </li>
                   
                    </ul>

                    {/* User Profile shown on navbar */}
                    <div
                        className="profile-hover-box"
                        onMouseEnter={() => setShowProfile(true)}
                        onMouseLeave={() => setShowProfile(false)}
                    >
                        <UserProfile compact />

                        {showProfile && (
                            <div className="profile-dropdown">
                                <UserProfile compact={false} />
                            </div>
                        )}
                    </div>


                </div>
            )}
        </nav>
    );
}

export default NavBar;
