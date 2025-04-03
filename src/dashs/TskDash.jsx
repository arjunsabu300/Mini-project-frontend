import React, { useState, useEffect } from "react";
import "./PrincipalDash.css";
import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const TskDash = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [currentDate, setDate] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    setDate(today);

    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.name);
        fetchNotifications(decoded.email);
      } catch (error) {
        console.error("Error decoding token: ", error);
      }
    }
  }, []);

  const fetchNotifications = async (userEmail) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/notifications?receiver=${userEmail}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <div className="app-container">
      <Header username={username} currentDate={currentDate} />
      <div className="main-area">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Dashboard navigate={navigate} notifications={notifications} />
      </div>
    </div>
  );
};

const Header = ({ username, currentDate }) => (
  <header className="header">
    <div className="header-left">
      <span>Welcome, {username}</span>
      <span>{currentDate}</span>
    </div>
    <div className="header-right">
      
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
          <li>
            <Link to="/Tskdash">
              <HomeIcon fontSize="medium" /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/mainstockdetails">
              <InventoryIcon fontSize="medium" /> Main Stock
            </Link>
          </li>
        </ul>
      )}
    </aside>
  );
};

const Dashboard = ({ navigate, notifications }) => (
  <main className="dashboard">
    <div className="dashboard-header">
      <h1>Dashboard</h1>
      <Notifications notifications={notifications} />
    </div>
    <div className="actions">
      <Button
        className="action-button"
        variant="contained"
        onClick={() => navigate("/forwardstocktsk")}
      >
        Forward Stock
      </Button>
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
        notifications.map((n, i) => <li key={i}>{n.message}</li>)
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

export default TskDash;
