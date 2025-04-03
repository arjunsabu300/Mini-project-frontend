import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Stocktransfer.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import AccountMenu from "../assets/Usermenu";
import Sidebars from "../assets/sidebar";
import { jwtDecode } from "jwt-decode";

const Stocktransfer = () => {
  const [stocks, setStocks] = useState([]); // Holds stock details
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [inventoryList, setInventoryList] = useState([]); // Stores room inventory

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.designation);
        fetchStockData();
        fetchInventory();
      } catch (error) {
        console.error("Invalid Token:", error);
      }
    }
  }, []);

  // ✅ Fetch room inventory (Room name + Room No)
  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/Room/rooms"); // Updated API route
      console.log("Fetched inventory data:", response.data);
      setInventoryList(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  // ✅ Fetch stock data
  const fetchStockData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/stock/stockdetails", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      
      // Ensure we are using item_no instead of indent_no
      setStocks(data.map(stock => ({
        ...stock,
        item_no: stock.item_no || stock.indent_no, // Fallback if API still returns indent_no
      })));
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // ✅ Handle room selection
  const handleRoomChange = (index, newRoomName) => {
    const selectedRoom = inventoryList.find((room) => room.name === newRoomName);
    if (!selectedRoom) {
      console.error("⚠️ Room not found for:", newRoomName);
      return;
    }

    setStocks((prevStocks) =>
      prevStocks.map((stock, i) =>
        i === index ? { ...stock, room_no: selectedRoom.room_no, room_name: newRoomName } : stock
      )
    );
  };

  // ✅ Batch Transfer for Stock
  const handleTransfer = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("User not authenticated.");
        return;
      }

      const decoded = jwtDecode(token);
      const senderEmail = decoded.email;

      const transfers = stocks
        .filter((stock) => stock.room_no && stock.item_no)
        .map(stock => ({
          item_no: stock.item_no,
          room_no: Number(stock.room_no), // Ensure room_no is a number
        }));

      if (transfers.length === 0) {
        alert("Please select at least one valid item with a room.");
        return;
      }

      console.log("🚀 Sending batch transfer:", JSON.stringify({ transfers, senderEmail }));

      const response = await fetch("http://localhost:5000/api/ststock/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transfers, senderEmail }),
      });

      const result = await response.json();
      console.log("✅ Transfer Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to transfer stock.");
      }

      alert("All selected items have been transferred successfully.");
      fetchStockData(); // Refresh stock data after transfers
    } catch (error) {
      console.error("❌ Error transferring stock:", error);
    }
  };

  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="headerstocktransfer">
          <h2>Stock Transfer</h2>
          <div className="stsearch-bar">
            <FaSearch className="stsearch-icon" />
            <input type="text" placeholder="Search Item ID" />
            <input type="date" />
            <button className="stfilter-btn" onClick={() => setFilterOpen(!filterOpen)}>
              <FaFilter /> Filter
            </button>
          </div>
          <div className="sttransferbtn">
            <Button variant="contained" endIcon={<SendIcon />} onClick={handleTransfer}>
              Transfer
            </Button>
          </div>
          <div className="stheader-icons">
            <FaBell className="stnotification-icon" />
            <div className="stuser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="stfilter-menu">
            <label>
              Product:
              <select className="stfilter">
                <option value="all">All</option>
                <option value="CPU">CPU</option>
                <option value="Monitor">Monitor</option>
              </select>
            </label>
          </div>
        )}

        <table className="ststock-table">
          <thead>
            <tr>
              <th>Item Number</th> {/* ✅ Updated from "Indent Number" */}
              <th>Date of Invoice</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Transfer To (Room No)</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <tr key={index}>
                <td>{stock.item_no}</td> {/* ✅ Updated from stock.indent_no */}
                <td>{new Date(stock.date_of_invoice).toLocaleDateString()}</td>
                <td>{stock.item_name}</td>
                <td>{stock.description}</td>
                <td>{stock.price}</td>
                <td>
                  <select
                    className="room-dropdown"
                    value={stock.room_name || ""}
                    onChange={(e) => handleRoomChange(index, e.target.value)}
                  >
                    <option value="">Select Room</option>
                    {inventoryList.map((room) => (
                      <option key={room._id} value={room.name}>
                        {room.name} (No: {room.room_no})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stocktransfer;
