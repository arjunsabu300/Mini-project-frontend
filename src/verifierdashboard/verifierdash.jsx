import React, { useState, useEffect } from 'react';
import "./verifier.css"
import { FaUserCircle, FaSignOutAlt, FaChartBar, FaCheckCircle, FaListAlt, FaBars } from 'react-icons/fa';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import UpdateIcon from "@mui/icons-material/Update";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import SendIcon from "@mui/icons-material/Send";
import AccountMenu from '../assets/Usermenu';
import { jwtDecode } from "jwt-decode";

import { useNavigate } from 'react-router-dom';
import Sidebarverifier from '../assets/sidebarverifier';


const notifications = [
];

const handleLogout = (navigate) => {
    sessionStorage.removeItem("token"); // Remove the token from storage
    navigate("/", {replace: true}); // Redirect to login page
    window.location.reload(); // Ensure the page reloads completely
    window.history.pushState(null,null,"/");
  };

const verifierDash = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [currentdate,setdate]=useState("");
    const [role,setRole]=useState(null);
    const navigate= useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token"); // Retrieve token from localStorage
                      if (token) {
                        try {
                          const decoded = jwtDecode(token); // Decode token to get user info
                          setRole(decoded.designation);
                        } catch (error) {
                          console.error("Invalid Token:", error);
                        }
                      }
                    const today = new Date().toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      });
                    setdate(today);
                    if(token){
                        try{
                            const decoded = jwtDecode(token);
                            setUserName(decoded.name);
                        }catch(error){
                            console.error("Error decoding token : ",error);
                        }
                    }
                },[]);


    return (
        <div className="app-container">
             <Header userName={userName} currentdate={currentdate}/>
            <div className="main-area">
                <Sidebarverifier sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role}/>
                <Dashboard navigate={navigate} />
            </div>
        </div>
    );
};

const Header = ({userName,currentdate}) => (
    <header className="header">
        <div className="header-left">
            <span>Welcome, {userName}</span>
            <span>{currentdate}</span>
        </div>
        <div className="header-right">
            <input type="search" placeholder="Search..." />
            <AccountMenu />
        </div>
    </header>
);


const Dashboard = ({navigate}) => (
    <main className="dashboard">
        <div className="dashboard-header">
            <h1>Dashboard</h1>
            <Notifications notifications={notifications} />
        </div>
        <div className="actions">
            <Link to ="/stockverify"><Button className='action-button' variant="contained">Verify Stocks</Button></Link>
        </div>
        <LogoutButton navigate={navigate} />
    </main>
);

const Notifications = ({ notifications }) => (
    <div className="notifications">
        <div className="notification-header">
            <h2>Notifications</h2>
        </div>
        <ul>
            {notifications.map((n, i) => (
                <li key={i}>{n.message}</li>
            ))}
        </ul>
        <Link to="/notify">View All</Link>
    </div>
);

const LogoutButton = ({navigate}) => {
    
    return (
    <button className="logout-button">
        <FaSignOutAlt className="logout-icon" onClick={()=>{handleLogout(navigate)}}/>
        Logout
    </button>
    );
};

export default verifierDash;