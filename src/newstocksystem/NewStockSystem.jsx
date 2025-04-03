import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaSearch } from "react-icons/fa";
import HomeIcon from "@mui/icons-material/Home";
import "./NewStockSystem.css";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <aside className={`clsidebar ${sidebarOpen ? "open" : "closed"}`}>
            <FaBars className="clmenu-icon" onClick={toggleSidebar} />
            {sidebarOpen && (
                <ul>
                    <li>
                        <Link to="/Hoddash">
                            <HomeIcon fontSize="medium" /> Dashboard
                        </Link>
                    </li>
                </ul>
            )}
        </aside>
    );
};

const NewStockSystem = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [roomData, setRoomData] = useState({
        room_no: "",
        name: "",
        type: ""
    });

    const handleChange = (e) => {
        setRoomData({ ...roomData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/rooms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(roomData)
            });

            if (response.ok) {
                alert("Room created successfully!");
                setRoomData({ room_no: "", name: "", type: "" });
            } else {
                alert("Error creating room.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server error!");
        }
    };

    return (
        <div className="nscontainer">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="nsmain-content">
                

                <div className="nsform-container">
                    <div className="nsform-title-container">
                        <h2 className="nsform-title">
                            New Stock <span>System</span>
                        </h2>
                    </div>
                    <input
                        type="text"
                        className="input-field"
                        name="room_no"
                        value={roomData.room_no}
                        onChange={handleChange}
                        placeholder="Enter Room No"
                    />
                    <br />
                    <input
                        type="text"
                        className="input-field"
                        name="name"
                        value={roomData.name}
                        onChange={handleChange}
                        placeholder="Enter Name of Premise"
                    />
                    <br />
                    <input
                        type="text"
                        className="input-field"
                        name="type"
                        value={roomData.type}
                        onChange={handleChange}
                        placeholder="Enter Type"
                    />
                    <br />
                    <button className="submit-btn" onClick={handleSubmit}>
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewStockSystem;
