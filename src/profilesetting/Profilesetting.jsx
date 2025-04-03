import React, { useState,useEffect } from "react";
import "./profile.css";
import { FaUserCircle } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaSearch, FaUser, FaBars, FaBell, FaFilter } from "react-icons/fa";
import ProfileMenu from "../assets/profileuser";
import Button from "@mui/material/Button";
import { jwtDecode } from "jwt-decode";
import Sidebarprincipal from "../assets/sidebarprincipal";
import Sidebarverifier from "../assets/sidebarverifier";
import Sidebars from "../assets/sidebar";

const UserProfile = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isEditable, setIsEditable] = useState(false);
    const [role,setRole]=useState(null);
    const [userName, setUserName] = useState("");
    const [emails,setEmail]=useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    designation: "",
    email: ""
  });

  const handleEdit = (e) => {
    setIsEditable(true); 
  };
  const handleEditSubmit = async () => {
    setIsEditable(false);
    try {
      const response = await fetch("http://localhost:5000/api/profile/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email, // Identify user by email
          name: formData.fullName, // Updated name
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Profile updated successfully!");
        setUserName(formData.fullName); // Update displayed name
      } else {
        alert("Error updating profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Retrieve token from localStorage
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode token to get user info
        setRole(decoded.designation);
        setUserName(decoded.name);
        setEmail(decoded.email);

        // Set initial form data
        setFormData({
          fullName: decoded.name || "",
          designation: decoded.designation || "",
          email: decoded.email || ""
        });
      } catch (error) {
        console.error("Error decoding token: ", error);
      }
    }
  }, []);

  

    const getSidebar = () => {
      if (!role) return null; // Prevents calling .toLowerCase() on null
      switch (role.toLowerCase()) {
        case "principal":
        case "hodcse":
          return <Sidebarprincipal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />;
        case "verifier":
          return <Sidebarverifier sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />;
        case "custodian":
        case "stock-in-charge":
          return <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />;
        default:
          return null;
      }
    };
    

  return (
    <div className="profilepage">
    <div className="profile-container">
        {getSidebar()}
      <div className="profile-content">
        <header className="profile-header">
          <h2>Welcome, {userName}</h2>
          <div className="psheader-icons">
            <FaBell className="psnotification-icon" />
            <ProfileMenu/>
          </div>
        </header>

        <div className="profile-card">
          <div className="profile-info">
            <FaUserCircle className="profile-icon" />
            <div>
              <h3>{userName}</h3>
              <p>{formData.email}</p>
            </div>
            <button className="edit-btn" onClick={handleEdit}><FiEdit /> Edit</button>
          </div>

          <div className="profile-form">
            <div className="psform-group">
              <label>Full Name</label>
              <input type="text" name="fullName" placeholder="Your First Name" value={formData.fullName} onChange={handleChange}
                  disabled={!isEditable} />
            </div>

            <div className="psform-group">
              <label>Designation</label>
              <textarea className="designationnanme" value={formData.designation} disabled/>
            </div>
          </div>

          <div className="psemail-section">
            <h4>My email Address</h4>
            <p>{formData.email}</p>
          </div>

          <button className="change-password-btn">Change Password</button>
          <div className="submit-btn-container">
          <Button className="Submiteditbtn" variant="contained" onClick={handleEditSubmit}>Submit</Button>
          </div>
        </div>
        
      </div>
    </div>
    </div>
  );
};

export default UserProfile;
