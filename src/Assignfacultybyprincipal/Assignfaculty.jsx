import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AssignFaculty.css";
import { FaSearch, FaBell } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import Button from "@mui/material/Button";
import Sidebarprincipal from "../assets/sidebarprincipal";
import { jwtDecode } from "jwt-decode";

const AssignFaculty = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [formData, setFormData] = useState({
    facultyName: "",
    email: "",
    department: "CSE", // Default and only option
    premise: "",
    lastDate: "",
  });

  const [message, setMessage] = useState(""); // Success/Error message
  const [loading, setLoading] = useState(false); // Loading state

  // Decode token to get user role
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.designation);
      } catch (error) {
        console.error("Invalid Token:", error);
      }
    }
  }, []);

  // Fetch inventory list from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Room/inventory");
        setInventoryList(response.data); // Set inventory data
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  const token = sessionStorage.getItem("token");
    try {
        const response = await axios.post("http://localhost:5000/api/assign-faculty",formData,
        {
                headers: {Authorization: `Bearer ${token}`,},
            }
        );
      if (response.status === 201) {
        setMessage("✅ Faculty assigned successfully!");
        setFormData({ facultyName: "", email: "", department: "CSE", premise: "", lastDate: "" });
      }
    } catch (error) {
      setMessage("❌ Assignment failed. Try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignfaculty-container">
      {/* Sidebar */}
      <Sidebarprincipal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      {/* Main Content */}
      <div className="asfmain-content">
        <header className="asfheader">
          <h2>Assign Faculty</h2>
          <div className="asfheader-icons">
            <FaSearch className="asfsearch-icon" />
            <FaBell className="asfnotification-icon" />
            <AccountMenu />
          </div>
        </header>

        {/* Assign Faculty Form */}
        <div className="assignfaculty-form">
          <h1>Assign Faculty</h1>
          {message && <p className="message">{message}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="facultyName"
              placeholder="Enter name of faculty"
              value={formData.facultyName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Enter Email of faculty"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <select name="department" value={formData.department} disabled>
                <option value="">Select Department</option>
              <option value="CSE">CSE</option>
            </select>
            <select name="premise" value={formData.premise} onChange={handleChange} required>
              <option value="">Select Premise</option>
              {inventoryList.map((room) => (
                <option key={room._id} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="lastDate"
              value={formData.lastDate}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" className="assign-btn" disabled={loading}>
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignFaculty;
