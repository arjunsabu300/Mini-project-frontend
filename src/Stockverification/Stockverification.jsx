import React, { useState, useEffect } from "react";
import "./stockverify.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Sidebarverifierreport from "../assets/Sidebarverifystock";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Stockverifications = () => {
  const [stocks, setStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [verifier, setVerifier] = useState({ name: "", email: "" });
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setVerifier({ name: decoded.name, email: decoded.email });
        setRole(decoded.designation);

        // Check for saved progress before fetching fresh data
        const savedStocks = localStorage.getItem(`savedStocks_${decoded.email}`);
        if (savedStocks) {
          setStocks(JSON.parse(savedStocks));
        } else {
          fetchStockDetails(token); // Fetch only if no saved progress exists
        }
      } catch (error) {
        console.error("Invalid Token:", error);
      }
    }
  }, []);

  const fetchStockDetails = async (token) => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/stock/stockdetails", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch stock details");

      const data = await response.json();

      // Only set data if no saved progress exists
      if (!localStorage.getItem(`savedStocks_${verifier.email}`)) {
        setStocks(data);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSaveProgress = () => {
    if (!verifier.email) {
      alert("No user logged in! Progress cannot be saved.");
      return;
    }

    localStorage.setItem(`savedStocks_${verifier.email}`, JSON.stringify(stocks));
    alert("Progress saved successfully! ✅");
  };

  const handleStatusChange = (index, newStatus) => {
    const updatedStocks = [...stocks];
    updatedStocks[index].status = newStatus;
    setStocks(updatedStocks);
  };

  const handleSubmit = async () => {
    const confirmSubmission = window.confirm(
      "After submission, the account will be deleted. Do you want to proceed?"
    );

    if (!confirmSubmission) {
      return;
    }
    
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const updatedVerificationData = [];

      for (const stock of stocks) {
        const stockUpdateResponse = await fetch("http://localhost:5000/api/ustock/updateStatus", {
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

        const verificationResponse = await fetch("http://localhost:5000/api/stockverify/Verification", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(newVerificationData),
        });

        if (!verificationResponse.ok) {
          console.error(`Failed to create verification record for item ${stock.item_no}`);
        }
      }

      // Clear saved progress after submission
      localStorage.removeItem(`savedStocks_${verifier.email}`);

      // Sending notification after all updates
      try {
        const verifnotifresponse = await fetch(
          "http://localhost:5000/api/stockverify/notifverification",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(updatedVerificationData[0]),
          }
        );

        if (!verifnotifresponse.ok) throw new Error("Failed to send notification");

        alert("Verification notification sent! ✅");
      } catch (err) {
        console.error("Error sending notification:", err.message);
      }
    } catch (error) {
      console.error("Error processing stock verification:", error);
    }
    navigate("/");
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
            <Button variant="outlined" color="primary" onClick={handleSaveProgress} style={{ marginLeft: "10px" }}>
              Save Progress
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
                  <input type="text" value={stock.Remarks || ""} onChange={(e) => {
                    const updatedStocks = [...stocks];
                    updatedStocks[index].Remarks = e.target.value;
                    setStocks(updatedStocks);
                  }} />
                </td>
                <td>
                <select
                    className={`vfstatus-dropdown ${
                      stock.status === "Working"
                        ? "vfworking"
                        : stock.status === "Not Working"
                        ? "vfnot-working"
                        : "vfnot-repairable"
                    }`}
                    value={stock.status}
                    onChange={(e) => {
                      const updatedStocks = [...stocks];
                      updatedStocks[index].status = e.target.value;
                      setStocks(updatedStocks);
                    }}
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
