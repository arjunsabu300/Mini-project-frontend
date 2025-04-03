import React, { useState, useEffect } from "react";
import "./Maintenancelist.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import { jwtDecode } from "jwt-decode";
import Sidebars from "../assets/sidebar";
import { TextField } from "@mui/material";

const MaintenanceList = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [role, setRole] = useState(null);

  const toggleFilterMenu = () => setFilterOpen(!filterOpen);

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

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/maintenance/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch maintenance data");
        const data = await response.json();
        setMaintenance(data);
      } catch (err) {
        console.error("Error fetching maintenance data:", err);
      }
    };
    fetchMaintenanceData();
  }, []);

  const handleFieldUpdate = async (id, field, value) => {
    try {
      const response = await fetch("http://localhost:5000/api/maintenance/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id, field, value }),
      });
      if (!response.ok) throw new Error("Update failed");
      setMaintenance(prev => prev.map(item => item._id === id ? { ...item, [field]: value } : item));
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleStatusUpdate = async (id, field, value) => {
    try {
      const response = await fetch("http://localhost:5000/api/maintenance/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id, field, value }),
      });
      if (!response.ok) throw new Error("Status update failed");
      setMaintenance(prev => prev.map(item => item._id === id ? { ...item, [field]: value } : item));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />
      <div className="sdmain-content">
        <header className="header-maintenance">
          <h2>Maintenance List</h2>
          <div className="mlsearch-bar">
            <FaSearch className="mlsearch-icon" />
            <input type="text" placeholder="Search Item ID" />
            <input type="date" />
            <button className="mlfilter-btn" onClick={toggleFilterMenu}>
              <FaFilter /> Filter
            </button>
          </div>
          <div className="mlheader-icons">
            <FaBell className="mlnotification-icon" />
            <div className="mluser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="mlfilter-menu">
            <label>Status:
              <select>
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <label>Service Provider:
              <select>
                <option value="all">All</option>
                <option value="Servicer1">Servicer1</option>
                <option value="Servicer2">Servicer2</option>
              </select>
            </label>
          </div>
        )}

        <table className="mlmaintenance-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Date of Repair</th>
              <th>Service Provider</th>
              <th>Amount</th>
              <th>Remarks</th>
              <th>Item Status</th>
              <th>Maintenance Status</th>
            </tr>
          </thead>
          <tbody>
            {maintenance.length === 0 ? (
              <tr><td colSpan="7">No maintenance items found</td></tr>
            ) : (
              maintenance.map(item => (
                <tr key={item._id}>
                  <td>{item.itemId}</td>
                  <td>{new Date(item.repairDate).toLocaleDateString("en-GB")}</td>
                  <td className="emailservice">{item.serviceProvider}</td>
                  <td>
                    <TextField
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleFieldUpdate(item._id, 'amount', e.target.value)}
                      size="small"
                    />
                  </td>
                  <td>
                    <TextField
                      value={item.remarks}
                      onChange={(e) => handleFieldUpdate(item._id, 'remarks', e.target.value)}
                      size="small"
                    />
                  </td>
                  <td>
                    <select
                      className={`status-dropdown ${item.itemStatus === "Working" ? "working" : "not-working"}`}
                      value={item.itemStatus}
                      onChange={(e) => handleStatusUpdate(item._id, 'itemStatus', e.target.value)}
                    >
                      <option value="Working">Working</option>
                      <option value="Not Working">Not Working</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={`status-dropdown ${item.maintenanceStatus === "Completed" ? "completed" : "pending"}`}
                      value={item.maintenanceStatus}
                      onChange={(e) => handleStatusUpdate(item._id, 'maintenanceStatus', e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceList;
