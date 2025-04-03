import React, { useState,useEffect } from 'react';
import './PrincipalDash.css';
import { FaUserCircle, FaSignOutAlt, FaChartBar, FaCheckCircle, FaListAlt, FaBars } from 'react-icons/fa';
import AccountMenu from '../assets/Usermenu';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Sidebarprincipal from '../assets/sidebarprincipal';

const PrincipalDash = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName,setusername]= useState("");
    const [currentdate,setdate]=useState("");
    const [role,setRole]=useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = sessionStorage.getItem("token");
                if (!token) return;

                const decoded = jwtDecode(token);
                setusername(decoded.name);
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
    
        useEffect(()=>{
            const today = new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "long",
                year: "numeric",
              });
            setdate(today);
            const token = sessionStorage.getItem("token");
            if (token) {
                try {
                    const decoded = jwtDecode(token); // Decode token to get user info
                    setRole(decoded.designation);
                    } catch (error) {
                        console.error("Invalid Token:", error);
                    }
                }
        },[]);

    return (
        <div className="app-container">
            <Header userName={userName} currentdate={currentdate}/>
            <div className="main-area">
                <Sidebarprincipal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />
                <Dashboard notifications={notifications} />
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


const Dashboard = ({notifications}) => (
    <main className="dashboard">
        <div className="dashboard-header">
            <h1>Dashboard</h1>
            <Notifications notifications={notifications} />
        </div>
        <div className="actions">
            <Link to="/assignfaculty"><Button className='action-button' variant="contained">Assign Faculty For Verification</Button></Link>
            <Link to="/stockdetreq"><Button className='action-button' variant="contained">Request For Stock Details</Button></Link>
            <Link to="/reportlist"><Button className='action-button' variant="contained">Reports</Button></Link>
            <Link to="/facultylist"><Button className='action-button' variant="contained">Assigned Faculty List</Button></Link>
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

export default PrincipalDash;