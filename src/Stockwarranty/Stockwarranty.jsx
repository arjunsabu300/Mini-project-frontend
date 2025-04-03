import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./warranty.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import Button from "@mui/material/Button";
import Sidebars from "../assets/sidebar";
import AccountMenu from "../assets/Usermenu";

const Stockwarranty = () => {
  const [stocks, setStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
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

    // Fetch stock details from backend
    axios
      .get("http://localhost:5000/api/stock/warrantydetails", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setStocks(response.data))
      .catch((error) => console.error("Error fetching stock data:", error));
  }, []);
  const filteredStocks = stocks.filter((stock) =>
    stock.item_no.toString().includes(searchTerm)
  );
  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="headerstockwarranty">
          <h2>Stock Warranty</h2>
          <div className="swsearch-bar">
            <FaSearch className="swsearch-icon" />
                        <input
                          type="text"
                          placeholder="Search Item ID"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
          </div>
          <div className="swbuttons">
            <Button variant="contained">Export</Button>
          </div>

          <div className="swheader-icons">
            <FaBell className="swnotification-icon" />
            <div className="swuser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="swfilter-menu">
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

        <table className="swstock-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Date of Invoice</th>
              <th>Indent No</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Warranty Expiry Date</th>
              <th>Warranty Status</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, index) => (
              <tr key={index}>
                <td>{stock.item_no}</td>
                <td>{new Date(stock.date_of_invoice).toLocaleDateString()}</td>
                <td>{stock.indent_no}</td>
                <td>{stock.item_name}</td>
                <td>{stock.description}</td>
                <td>{new Date(stock.expiry_date).toLocaleDateString()}</td> {/* Directly using expiry_date */}
                <td>
                  <span className={`swwarranty-label ${stock.warranty_status === "In Warranty" ? "swin-warranty" : "swout-of-warranty"}`}>
                    {stock.warranty_status}
                  </span>
                </td>
                <td>
                  <span className={`swstatus-label ${stock.status === "Working" ? "swworking" : "swnot-working"}`}>
                    {stock.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stockwarranty;
