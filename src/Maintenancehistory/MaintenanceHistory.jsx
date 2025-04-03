import React, { useState, useEffect } from "react";
import "./maintenancehistory.css";
import { FaSearch, FaUser, FaBars, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import { jwtDecode } from "jwt-decode";
import Sidebars from "../assets/sidebar";
//import Button from '@mui/material/Button';


const Maintenancehistorydetails = () => {
  const [mstocks, setmStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/maintenance/maintenancehistory", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch stock details");

        const data = await response.json();
        setmStocks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, []);


  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="mhheaderstockdetails">
          <h2>Stocks</h2>
          <div className="mhsearch-bar">
            <FaSearch className="mhsearch-icon" />
            <input type="text" placeholder="Search Item ID" />
          </div>
          <input className="datetype" type="date" />
          <button className="mhfilter-btn" onClick={toggleFilterMenu}>
            <FaFilter /> Filter
          </button>

          <div className="mhheader-icons">
            <FaBell className="mhnotification-icon" />
            <div className="mhuser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="mhfilter-menu">
            <label>
              Status:
              <select>
                <option value="all">All</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </label>
            <label>
              Product:
              <select>
                <option value="all">All</option>
                <option value="CPU">CPU</option>
                <option value="Monitor">Monitor</option>
              </select>
            </label>
          </div>
        )}

        <table className="mhstock-table">
          <thead>
            <tr>
              <th>Item No</th>
              <th>Maintenance Status </th>
              <th>Completed date</th>
              <th>Remarks</th>
              <th>Amount</th>
              <th>Item Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7">Error: {error}</td>
              </tr>
            ) : mstocks.length === 0 ? (
              <tr>
                <td colSpan="7">No maintenance details found</td>
              </tr>
            ) : (
              mstocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.item_no}</td>
                  <td>{stock.status}</td>
                  <td>{new Date(stock.completed_date).toLocaleDateString("en-GB")}</td>
                  <td>{stock.remarks}</td>
                  <td>{stock.amount}</td>
                  <td>
                    <span
                      className={`mhstatus-label ${
                        stock.item_status === "Working" ? "working" : "not-working"
                      }`}
                    >
                      {stock.item_status}
                    </span>
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

export default Maintenancehistorydetails;
