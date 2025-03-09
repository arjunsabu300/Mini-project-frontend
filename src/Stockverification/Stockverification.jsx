import React, { useState, useEffect } from "react";
import "./stockverify.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Sidebarverifierreport from "../assets/Sidebarverifystock";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Stockverifications = () => {
  const [stocks, setStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [verifier, setVerifier] = useState({ name: "", email: "" });
  const [role, setRole] = useState(null);
  const [verifdata, setVerifdata] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setVerifier({ name: decoded.name, email: decoded.email });
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
        const response = await fetch("https://mini-project-backend-kjld.onrender.com/api/stock/stockdetails", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch stock details");
        const data = await response.json();
        setStocks(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchStockDetails();
  }, []);

  const handleStatusChange = (index, newStatus) => {
    const updatedStocks = [...stocks];
    updatedStocks[index].status = newStatus;
    setStocks(updatedStocks);
  };

  const handleSubmit = async () => {

    const confirmSubmission = window.confirm("After submission, the account will be deleted. Do you want to proceed?");
    
    if (!confirmSubmission) {
        return; // Exit the function if the user cancels
    }
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const updatedVerificationData = [];

      for (const stock of stocks) {
        const stockUpdateResponse = await fetch("https://mini-project-backend-kjld.onrender.com/api/ustock/updateStatus", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ item_no: stock.item_no, status: stock.status }),
        });

        if (!stockUpdateResponse.ok) {
          console.error(`Failed to update status for item ${stock.item_no}`);
          continue;
        }

        const newVerificationData = {
          verifierName: verifier.name,
          verifierEmail: verifier.email,
          dateOfVerify: new Date().toISOString(),
          itemNo: stock.item_no,
          statusOfItem: stock.status,
          remarks: stock.Remarks || "",
        };

        updatedVerificationData.push(newVerificationData);

        const verificationResponse = await fetch("https://mini-project-backend-kjld.onrender.com/api/stockverify/Verification", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(newVerificationData),
        });

        if (!verificationResponse.ok) {
          console.error(`Failed to create verification record for item ${stock.item_no}`);
        }
      }

      setVerifdata(updatedVerificationData);

      // Sending notification after all updates
      try {
        const verifnotifresponse = await fetch("https://mini-project-backend-kjld.onrender.com/api/stockverify/notifverification", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(updatedVerificationData[0]),
        });

        if (!verifnotifresponse.ok) throw new Error("Failed to send notification");

        alert("Verification notification sent! ✅");
      } catch (err) {
        console.error("Error sending notification:", err.message);
      }
    } catch (error) {
      console.error("Error processing stock verification:", error);
    }
    navigate('/');

  };

  return (
    <div className="sdstocks-container">
      <Sidebarverifierreport sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />
      <div className="sdmain-content">
        <header className="headerstockverificaton">
          <h2>Stock Verification</h2>
          <div className="vfsearch-bar">
            <FaSearch className="vfsearch-icon" />
            <input type="text" placeholder="Search Item ID" />
            <input type="date" />
            <button className="vffilter-btn" onClick={() => setFilterOpen(!filterOpen)}>
              <FaFilter /> Filter
            </button>
          </div>
          <div className="verifybtn">
            <Button variant="contained" endIcon={<SendIcon />} onClick={handleSubmit}>
              Submit
            </Button>
          </div>
          <div className="vfheader-icons">
            <FaBell className="vfnotification-icon" />
            <div className="vfuser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="vffilter-menu">
            <label>
              Status:
              <select>
                <option value="all">All</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </label>
          </div>
        )}

        <table className="vfstock-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Indent No</th>
              <th>Date of Invoice</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Remarks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <tr key={index}>
                <td>{stock.item_no}</td>
                <td>{stock.indent_no}</td>
                <td>{new Date(stock.date_of_invoice).toLocaleDateString()}</td>
                <td>{stock.item_name}</td>
                <td>{stock.description}</td>
                <td>
                  <input
                    className="remarkinput"
                    type="text"
                    value={stock.Remarks || ""}
                    onChange={(e) => {
                      const updatedStocks = [...stocks];
                      updatedStocks[index].Remarks = e.target.value;
                      setStocks(updatedStocks);
                    }}
                  />
                </td>
                <td>
                  <select
                  className={`vfstatus-dropdown ${
                    stock.status === "Working" ? "vfworking" : stock.status === "Not Working" ? "vfnot-working" : "vfnot-repairable"
                  }`}
                    value={stock.status}
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Working">Working</option>
                    <option value="Not Working">Not Working</option>
                    <option value="Not Repairable">Not Repairable</option>
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

export default Stockverifications;
