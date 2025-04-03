import React, { useState, useEffect } from "react";
import "./MainStockdetails.css";
import { FaSearch, FaBars, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Link } from "react-router-dom";

const MainStockdetails = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/mainstock");
        if (!response.ok) throw new Error("Failed to fetch stock details");
        const data = await response.json();
        setStocks(Array.isArray(data) ? data : [data]);
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
      {/* Sidebar */}
      <aside className={`sdsidebar ${sidebarOpen ? "open" : "closed"}`}>
        <FaBars className="sdmenu-icon" onClick={() => setSidebarOpen(!sidebarOpen)} />
        {sidebarOpen && (
          <ul>
            <li><HomeIcon fontSize="medium" /><Link to="/Tskdash"> Dashboard</Link></li>
            <li><InventoryIcon fontSize="medium" /><Link to="/Mainstockdetails"> Main Stock</Link></li>
          </ul>
        )}
      </aside>

      {/* Main Content */}
      <div className="sdmain-content">
        <header className="sdheaderstockdetails">
          <h2>Stocks</h2>
          <div className="sdsearch-bar">
            <FaSearch className="sdsearch-icon" />
            <input type="text" placeholder="Search Item ID" />
          </div>
          <input className="datetype" type="date" />
          <button className="sdfilter-btn" onClick={() => setFilterOpen(!filterOpen)}>
            <FaFilter /> Filter
          </button>
          <div className="sdheader-icons">
            <FaBell className="sdnotification-icon" />
            <div className="sduser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {/* Filter Dropdown */}
        {filterOpen && (
          <div className="sdfilter-menu">
            <label>Status:
              <select>
                <option value="all">All</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </label>
          </div>
        )}

        {/* Stock Table */}
        <table className="sdstock-table">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Indent No</th>
              <th>Date of Purchase</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan="6">Error: {error}</td></tr>
            ) : stocks.length === 0 ? (
              <tr><td colSpan="6">No stock details found</td></tr>
            ) : (
              stocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.sl_no}</td>
                  <td>{stock.indent_no}</td>
                  <td>{new Date(stock.date_of_purchase).toLocaleDateString()}</td>
                  <td>{stock.price}</td>
                  <td>{stock.quantity}</td>
                  <td>{stock.department}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MainStockdetails;
