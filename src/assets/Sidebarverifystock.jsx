import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from '@mui/icons-material/Article';
import "../assets/sidebar.css";



const Sidebarverifierreport = ({ sidebarOpen, setSidebarOpen, role }) => {
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/verifydash");
    };
    
    return (
        <aside className={`assidebar ${sidebarOpen ? "open" : "closed"}`}>
            <FaBars className="asmenu-icon" onClick={toggleSidebar} />
            {sidebarOpen && (
                    <ul>
                        <li></li>
                        <li></li>
                        <li>
                        <HomeIcon fontSize="medium" />
                        {role.toLowerCase() === "verifier" ? (
                                <span onClick={handleNavigate}> Dashboard </span>
                            ) : (
                                <span> Dashboard </span>
                            )}

                        </li>
                    </ul>
                )}
        </aside>
    );
};

export default Sidebarverifierreport;
