import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import UpdateIcon from "@mui/icons-material/Update";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import SendIcon from "@mui/icons-material/Send";
import "../assets/sidebar.css"



const Sidebars = ({ sidebarOpen, setSidebarOpen, role }) => {
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const navigate = useNavigate();

    return (
        <aside className={`assidebar ${sidebarOpen ? "open" : "closed"}`}>
            <FaBars className="asmenu-icon" onClick={toggleSidebar} />
            {sidebarOpen && (
                <ul>
                <li></li>
                      <li></li>
                      <li> <HomeIcon fontSize="medium" />
                      <span onClick={() => navigate(role.toLowerCase() === "stock-in-charge" ? "/Sicdash" : "/Custdash")}> Dashboard </span></li>
                      <li><InventoryIcon fontSize="medium"/><Link to="/stockdetails">   Stock Details</Link></li>
                      <li><UpdateIcon fontSize="medium"/> <Link to="/stockstatus"> Stock Status Update</Link> </li>
                      <li><HealthAndSafetyIcon fontSize="medium"/> <Link to="/stockwarranty"> Stock Warranty</Link></li>
                      {(role.toLowerCase() === "stock-in-charge" || role.toLowerCase() === "furniture-custodian") && (
                        <li>
                            <Link to="/stocktransfer">
                                <SendIcon fontSize="medium" /> Stock Transfer
                            </Link>
                        </li>
                    )}
                </ul>
            )}
        </aside>
    );
};

export default Sidebars;
