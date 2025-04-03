import React, { useState,useEffect } from 'react';
import './PrincipalDash.css';
import { FaUserCircle, FaSignOutAlt, FaChartBar, FaCheckCircle, FaListAlt, FaBars } from 'react-icons/fa';
import AccountMenu from '../assets/Usermenu';
import Button from '@mui/material/Button';
import Sidebardash from '../assets/Sidebarfordash';
import {jwtDecode} from "jwt-decode";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const handleLogout = (navigate) => {
    sessionStorage.removeItem("token"); // Remove the token from storage
    navigate("/", {replace: true}); // Redirect to login page
    window.location.reload(); // Ensure the page reloads completely
    window.history.pushState(null,null,"/");
  };

const CustodianDash = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [username,setusername]= useState("");
    const [currentdate,setdate]=useState("");
    const [premisename,setPremisename]= useState("");
    const [role,setRole]=useState(null);
    const [notifications, setNotifications] = useState([]);
    const [handoverPopup, setHandoverPopup] = useState(false);
    const navigate= useNavigate();

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
        if(token){
            try{
                const decoded = jwtDecode(token);
                setusername(decoded.name);
            }catch(error){
                console.error("Error decoding token : ",error);
            }
        }
        
        if (token) {
            try {
                const decoded = jwtDecode(token); // Decode token to get user info
                setRole(decoded.designation);
                setPremisename(decoded.roomname);
                } catch (error) {
                    console.error("Invalid Token:", error);
                }
            }
    },[]);

    return (
        <div className="app-container">
            <Header username={username} currentdate={currentdate} premisename={premisename}/>
            <div className="main-area">
                <Sidebardash sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />
                <Dashboard notifications={notifications} navigate={navigate} setHandoverPopup={setHandoverPopup} />
            </div>
            <HandoverPopup open={handoverPopup} onClose={() => setHandoverPopup(false)} navigate={navigate} />
        </div>
    );
};

const Header = ({username,currentdate,premisename}) => (
    <header className="header">
        <div className="header-left">
            <span>Welcome, {username}</span>
            <span>{currentdate}</span>
        </div>
        <div className="header-right">
           <span>{premisename}</span>
            <AccountMenu />
        </div>
    </header>
);


const Dashboard = ({notifications,navigate,setHandoverPopup }) => (
    <main className="dashboard">
        <div className="dashboard-header">
            <h1>Dashboard</h1>
            <Notifications notifications={notifications} />
        </div>
        <div className="actions">
                <Link to="/maintenance"><Button className='action-button' variant="contained">Maintenance List</Button></Link>
                <Link to="/maintenancehist"><Button className='action-button' variant="contained">Maintenance History</Button></Link>
                <Button onClick={()=>{handlesendmail()}} className='action-button' variant="contained">Send Email</Button>
                <Link to="/transferlog"><Button className='action-button' variant="contained">Transfer Log Details</Button></Link>
                <Button className='action-button' variant="contained" onClick={() => setHandoverPopup(true)}>Stock Handover</Button>
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

const HandoverPopup = ({ open, onClose, navigate }) => {
    const handleHandover = async () => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                alert("User not authenticated.");
                return;
            }
            const decoded = jwtDecode(token);
            const senderEmail = decoded.email;

            console.log("🚀 Initiating handover for:", senderEmail);

            const response = await fetch("http://localhost:5000/api/handover", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ senderEmail }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to process handover.");
            }

            alert(data.message);
            onClose();
        } catch (error) {
            console.error("Error processing handover:", error);
            alert(error.message || "Error processing handover.");
        }
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="handover-modal" aria-describedby="handover-description">
            <Box className="handover-modal">
                <h2>Confirm Handover</h2>
                <p>By continuing, you will lose all access to the rooms. Are you sure you want to proceed?</p>
                <div className="modal-actions">
                    <Button variant="contained" color="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleHandover}>Confirm</Button>
                </div>
            </Box>
        </Modal>
    );
};

const LogoutButton = ({navigate}) => (
    <button className="logout-button">
        <FaSignOutAlt className="logout-icon" onClick={()=>{handleLogout(navigate)}}/>
        Logout
    </button>
);

export default CustodianDash;
