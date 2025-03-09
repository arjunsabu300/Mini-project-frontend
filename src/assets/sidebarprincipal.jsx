import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from '@mui/icons-material/Article';
import "../assets/sidebardash.css";



const Sidebarprincipal = ({ sidebarOpen, setSidebarOpen, role }) => {
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const navigate = useNavigate();

    return (
        <aside className={`aassidebar ${sidebarOpen ? "open" : "closed"}`}>
            <FaBars className="aasmenu-icon" onClick={toggleSidebar} />
            {sidebarOpen && (
                <ul>
                <li></li>
                      <li></li>
                      <li> <HomeIcon fontSize="medium" />
                      <span onClick={() => navigate(role.toLowerCase() === "principal" ? "/principaldash" : "/Hoddash")}> Dashboard </span></li>

                      {role.toLowerCase() === "principal" && (
                        <li>
                            <li><Link to="/reportlist"><ArticleIcon fontSize="medium" /> Reports </Link></li>
                        </li>
                    )}
                </ul>
            )}
        </aside>
    );
};

export default Sidebarprincipal;
