import React, { useState, useEffect } from 'react';
import './PrincipalDash.css';
import { FaSignOutAlt, FaBars } from 'react-icons/fa';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AccountMenu from '../assets/Usermenu';
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const HodDash = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = sessionStorage.getItem("token");
                if (!token) return;

                const decoded = jwtDecode(token);
                setUserName(decoded.name);
                const userEmail = decoded.email;

                const response = await axios.get(`http://localhost:5000/api/notifications?receiver=${userEmail}`);
                
                console.log("Dashboard Notifications:", response.data); // Debugging

                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div className="app-container">
            <Header userName={userName} />
            <div className="main-area">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Dashboard notifications={notifications} />
            </div>
        </div>
    );
};

const Header = ({ userName }) => (
    <header className="header">
        <div className="header-left">
            <span>Welcome, {userName}</span>
        </div>
        <div className="header-right">
            <input type="search" placeholder="Search..." />
            <AccountMenu />
        </div>
    </header>
);

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <aside className={`clsidebar ${sidebarOpen ? "open" : "closed"}`}>
            <FaBars className="clmenu-icon" onClick={toggleSidebar} />
            {sidebarOpen && (
                <ul>
                    <li><Link to="/Hoddash"><HomeIcon fontSize="medium" /> Dashboard</Link></li>
                </ul>
            )}
        </aside>
    );
};

const Dashboard = ({ notifications }) => (
    <main className="dashboard">
        <div className="dashboard-header">
            <h1>Dashboard</h1>
            <Notifications notifications={notifications} />
        </div>
        <div className="actions">
            <Link to="/register"><Button className='action-button' variant="contained">Create Account</Button></Link>
            <Link to="/deleteacc"><Button className='action-button' variant="contained">Remove Account</Button></Link>
            <Link to="/forwardstockhod"><Button className='action-button' variant="contained">Forward Stock</Button></Link>
            <Link to="/newstocksystem"><Button className='action-button' variant="contained">Add Stock System </Button></Link>
        </div>
        <LogoutButton />
    </main>
);

const Notifications = ({ notifications }) => (
    <div className="notifications">
        <div className="notification-header">
            <h2>Notifications</h2>
        </div>
        <ul>
            {notifications.length > 0 ? (
                notifications.map((n, i) => (
                    <li key={i}>{n.message || "New notification received"}</li>
                ))
            ) : (
                <li>No new notifications</li>
            )}
        </ul>
        <Link to="/notify">View All</Link>
    </div>
);

const LogoutButton = () => (
    <button className="logout-button">
        <FaSignOutAlt className="logout-icon" />
        Logout
    </button>
);

export default HodDash;
