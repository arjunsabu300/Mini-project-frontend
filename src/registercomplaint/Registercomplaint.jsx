import React, { useState, useEffect } from "react";
import "./registercomplaint.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import { jwtDecode } from "jwt-decode";
import Sidebars from "../assets/sidebar";
import Button from "@mui/material/Button";
import axios from "axios";

const RegisterComplaint = () => {
  const [stocks, setStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  //const [filterOpen, setFilterOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [emails, setEmail] = useState("");

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
        const response = await axios.get("http://localhost:5000/api/complaints/registercomplaint", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filteredData = Array.isArray(response.data)
          ? response.data.filter((stock) => stock.status === "Not Working" && !stock.maintenance_date)
          : [];
        setStocks(filteredData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, []);

  const handleSelectItem = (item) => {
    setSelectedItems((prev) =>
      prev.some((selected) => selected.item_no === item.item_no)
        ? prev.filter((selected) => selected.item_no !== item.item_no)
        : [...prev, item]
    );
  };

  const handleSubmitComplaint = async () => {
    if (!emails.trim() || !emails.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (selectedItems.length === 0) {
      alert("No items selected for complaint.");
      return;
    }

    const complaintData = {
      emails,
      items: selectedItems.map(({ item_no, item_name, description, price, status }) => ({
        item_no,
        item_name,
        description,
        price,
        status,
      })),
    };

    setLoading(true);
    try {
      console.log("🚀 Sending complaintData:", complaintData);
      const response = await axios.post("http://localhost:5000/api/complaints/sendcomplaint",complaintData,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}`  },
      });
      alert("Complaint registered successfully: " + response.data.message);
      setSelectedItems([]);
      setEmail("");
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to register complaint. Please try again.");
    } finally {
      setLoading(true);
    }
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.item_no.toString().includes(searchTerm)
  );

  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="rgheader">
          <h2>Register Complaint</h2>
          <div className="rgsearch-bar">
            <FaSearch className="rgsearch-icon" />
            <input
              type="text"
              placeholder="Search Item ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input className="datetype" type="date" />

          <div className="rgheader-icons">
            <FaBell className="rgnotification-icon" />
            <AccountMenu />
          </div>
        </header>

        <div className="rgemail-input">
          <label htmlFor="email">Recipient Email:</label>
          <input className="rgemail"
            type="email"
            id="email"
            value={emails}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter recipient email"
          />
        </div>

        <table className="rgstock-table">
          <thead>
            <tr>
              <th>Select</th>
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
            {loading ? (
              <tr>
                <td colSpan="8">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8">Error: {error}</td>
              </tr>
            ) : filteredStocks.length === 0 ? (
              <tr>
                <td colSpan="8">No stock details found</td>
              </tr>
            ) : (
              filteredStocks.map((stock) => (
                <tr key={stock.item_no}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => handleSelectItem(stock)}
                      checked={selectedItems.some((item) => item.item_no === stock.item_no)}
                    />
                  </td>
                  <td>{stock.item_no}</td>
                  <td>{stock.indent_no}</td>
                  <td>{stock.item_name}</td>
                  <td>{new Date(stock.date_of_invoice).toLocaleDateString()}</td>
                  <td>{stock.description}</td>
                  <td>{stock.price}</td>
                  <td>
                    <span className={`rgstatus-label ${stock.status.toLowerCase().replace(" ", "-")}`}>
                      {stock.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitComplaint}
          style={{ marginTop: "10px" }}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Complaint"}
        </Button>
      </div>
    </div>
  );
};

export default RegisterComplaint;
