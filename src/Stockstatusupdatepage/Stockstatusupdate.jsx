import React, { useState, useEffect } from "react";
import "./Stockstatusupdate.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import { jwtDecode } from "jwt-decode";
import Sidebars from "../assets/sidebar";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";



const Stockstatusupdate = () => {
  const [stocks, setStocks] = useState([]);
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
    const fetchStockDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/stock/stockdetails", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch stock details");
        const data = await response.json();
        setStocks(data);
      } catch (err) {
        console.error("Error fetching stock details:", err);
      }
    };

    fetchStockDetails();
  }, []);

  const handleStatusChange = async (index, newStatus) => {
    console.log("Updating status for item:", stocks[index]?.item_no, "to", newStatus);
  
    if (!stocks[index] || !stocks[index].item_no) {
      console.error("Error: Stock item or item_no is undefined.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/ustock/updateStatus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include token if required
        },
        body: JSON.stringify({
          item_no: stocks[index].item_no, // Use item_no instead of id
          status: newStatus,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Status updated successfully:", data);
  
      // Update state after successful API response
      const updatedStocks = [...stocks];
      updatedStocks[index].status = newStatus;
      setStocks(updatedStocks);
    } catch (error) {
      console.error("Error updating stock status:", error);
    }
  };
  
  

  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="headerstockdetails">
          <h2>Stock Status Update</h2>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search Item ID" />
            <input type="date" />
            <button className="filter-btn" onClick={toggleFilterMenu}>
              <FaFilter /> Filter
            </button>
            <Link to="/regcomplaint"><Button className="regbtn">Register Complaint</Button></Link>
          </div>
          <div className="header-icons">
            <FaBell className="notification-icon" />
            <div className="user-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="filter-menu">
            <label>Status:
              <select>
                <option value="all">All</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </label>
            <label>Product:
              <select>
                <option value="all">All</option>
                <option value="CPU">CPU</option>
                <option value="Monitor">Monitor</option>
              </select>
            </label>
          </div>
        )}

        <table className="stock-table">
          <thead>
            <tr>
              <th>Item No</th>
              <th>Indent No</th>
              <th>Item Name</th>
              <th>Date of Invoice</th>
              <th>Description</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr><td colSpan="7">No stock details found</td></tr>
            ) : (
              stocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.item_no}</td>
                  <td>{stock.indent_no}</td>
                  <td>{stock.item_name}</td>
                  <td>{new Date(stock.date_of_invoice).toLocaleDateString()}</td>
                  <td>{stock.description}</td>
                  <td>{stock.price}</td>
                  <td>
                  {stock.status === "Not Repairable" ? (
                    <span className="not-repairable-text">Not Repairable</span>
                  ) : (
                    <select
                      className={`status-dropdown ${
                        stock.status === "Working" ? "working" : "not-working"
                      }`}
                      value={stock.status}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                    >
                      <option value="Working">Working</option>
                      <option value="Not Working">Not Working</option>
                    </select>
                  )}
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

export default Stockstatusupdate;
