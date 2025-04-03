import React, { useState, useEffect } from "react";
import "./stockclear.css";
import { FaSearch, FaUser, FaBars, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from "jwt-decode";
import Sidebars from "../assets/sidebar";

const Stockclears = () => {
  const [cstocks, setcStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [checkedStocks, setCheckedStocks] = useState({});
  const [role, setRole] = useState(null);
  
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
      if (!token) return;
  
      try {
        const response = await fetch("http://localhost:5000/api/stockclearance", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) throw new Error("Failed to fetch stock details");
  
        const data = await response.json();
        setcStocks(data);
      } catch (err) {
        console.error(err.message);
      }
    };
  
    fetchStockDetails();
  }, []);

  const handleCheckboxChange = (id) => {
    setCheckedStocks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClearStocks = async () => {
    const selectedItems = Object.keys(checkedStocks).filter((item_no) => checkedStocks[item_no]);
    if (selectedItems.length === 0) {
      alert("Please select items to clear.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/clear-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ item_ids: selectedItems }),
      });

      if (!response.ok) throw new Error("Failed to clear stocks");

      // Update UI after successful clearance
      setcStocks((prev) =>
        prev.map((stock) =>
          selectedItems.includes(stock.item_no)
            ? { ...stock, status: "Cleared", clearance_date: new Date().toLocaleDateString()}
            : stock
        )
      );

      setCheckedStocks({});
    } catch (error) {
      console.error("Error clearing stocks:", error);
    }
  };

  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />
      <div className="sdmain-content">
        <header className="headerstockclears">
          <h2>Stock Clearance</h2>
          <div className="clsearch-bar">
            <FaSearch className="clsearch-icon" />
            <input type="text" placeholder="Search Item ID" />
          </div>
          <input className="cldatetype" type="date" />
          <button className="clfilter-btn" onClick={() => setFilterOpen(!filterOpen)}>
            <FaFilter /> Filter
          </button>

          <div className="clnewbuttons">
            <Button variant="contained" onClick={handleClearStocks} endIcon={<DeleteIcon />}>
              Clear Stocks
            </Button>
          </div>

          <div className="clheader-icons">
            <FaBell className="clnotification-icon" />
            <div className="cluser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="clfilter-menu">
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

        <table className="clstock-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Item ID</th>
              <th>Remarks</th>
              <th>Status</th>
              <th>Clearance Date</th>
            </tr>
          </thead>
          <tbody>
            {cstocks.map((stock) => (
              <tr key={stock.item_no}>
                <td>
                  <input
                    type="checkbox"
                    checked={checkedStocks[stock.item_no] || false}
                    onChange={() => handleCheckboxChange(stock.item_no)}
                  />
                </td>
                <td>{stock.item_no}</td>
                <td>{stock.remarks}</td>
                <td>
                  <span className={`clstatus-label ${stock.status === "Cleared" ? "cleared" : "pending"}`}>
                    {stock.status}
                  </span>
                </td>
                <td>{stock.clearance_date ? new Date(stock.clearance_date).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stockclears;
