import React, { useState, useEffect } from "react";
import axios from "axios";
import "./transferlog.css";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import { jwtDecode } from "jwt-decode";
import Sidebars from "../assets/sidebar";
import Button from "@mui/material/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const TransferLogDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [transferLogs, setTransferLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.designation);
        fetchTransferLogs(token);
      } catch (error) {
        console.error("Invalid Token:", error);
      }
    }
  }, []);

  // Fetch Transfer Logs from API
  const fetchTransferLogs = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/transferlogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransferLogs(response.data);
    } catch (error) {
      console.error("Error fetching transfer logs:", error);
    }
  };
  console.log(transferLogs)

  // Export to PDF
  const exportToPDF = () => {
    const docu = new jsPDF();
    docu.text("Transfer Log Details", 14, 10);
    const tableColumn = ["Item No", "Sender", "Receiver", "Sender Room", "Receiver Room", "Date"];
    const tableRows = transferLogs.map((log) => [
      log.item_no,
      log.sender_email,
      log.receiver_email,
      `${log.sender_room_no} - ${log.sender_room_name}`,
      `${log.receiver_room_no} - ${log.receiver_room_name}`,
      new Date(log.date).toLocaleDateString(),
    ]);

    autoTable(docu, { // Use autoTable function
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    docu.save("Transfer_Log_Details.pdf");
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      transferLogs.map((log) => ({
        "Item No": log.item_no,
        "Sender Email": log.sender_email,
        "Receiver Email": log.receiver_email,
        "Sender Room": `${log.sender_room_no} - ${log.sender_room_name}`,
        "Receiver Room": `${log.receiver_room_no} - ${log.receiver_room_name}`,
        "Date": new Date(log.date).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TransferLogs");
    XLSX.writeFile(workbook, "Transfer_Log_Details.xlsx");
  };

  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="tld-header">
          <h2>Transfer Log Details</h2>
          <div className="tld-search-bar">
            <FaSearch className="tld-search-icon" />
            <input
              type="text"
              placeholder="Search Item No"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="tldexport-buttons">
            <button className="tldexport-btn" onClick={() => setExportOpen(!exportOpen)}>
              Export
            </button>
          </div>

          {exportOpen && (
            <div className="tldexport-menu">
              <Button className="exporttopdfbtn" onClick={exportToPDF}>Export as PDF</Button>
              <Button className="exporttoexcelbtn" onClick={exportToExcel}>Export as Excel</Button>
            </div>
          )}

          <div className="tld-header-icons">
            <FaBell className="tld-notification-icon" />
            <div className="tld-user-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        <table className="tld-table">
          <thead>
            <tr>
              <th>Item No</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Sender Room</th>
              <th>Receiver Room</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transferLogs.length === 0 ? (
              <tr>
                <td colSpan="6">No transfer logs found</td>
              </tr>
            ) : (
              transferLogs
                .filter((log) => log.item_no && typeof log.item_no === "string" && log.item_no.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((log, index) => (
                  <tr key={index}>
                    <td>{log.item_no}</td>
                    <td>{log.sender_email}</td>
                    <td>{log.receiver_email}</td>
                    <td>{log.sender_room_no} - {log.sender_room_name}</td>
                    <td>{log.receiver_room_no} - {log.receiver_room_name}</td>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferLogDetails;
