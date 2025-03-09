import React, { useState, useEffect } from "react";
import "./reportdetails.css";
import axios from "axios";
import { FaSearch, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import Sidebarprincipalreport from "../assets/sidebarreport";
import Button from '@mui/material/Button';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";


const Reportdetails = () => {
  const [reports, setReports] = useState([]);
  const [verifierEmail, setVerifierEmail] = useState("");
  const [dateOfVerify, setDateOfVerify] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  

  const [searchParams] = useSearchParams();
  const notifId = searchParams.get("notifId");
  console.log(notifId);

  const toggleFilterMenu = () => setFilterOpen(!filterOpen);
  const toggleExportMenu = () => setExportOpen(!exportOpen);

  useEffect(() => {
    const fetchReportDetails = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }
  
      const decoded = jwtDecode(token);
      setRole(decoded.designation);
      
  
      try {
        const response = await axios.post(
          "https://mini-project-backend-kjld.onrender.com/api/report/reportviews",
          { notifId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
  
          const data = response.data;
          setVerifierEmail(data.verifier_email);
          setDateOfVerify(new Date(data.verify_date).toLocaleDateString());
          setReports(data.itemDetails || []);
        console.log("Fetched data:", data);

      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch report details");
      } finally {
        setLoading(false);
      }
    };
  
    if (notifId) {
      fetchReportDetails();
    }
  }, [notifId]); // Depend on notifId properly
  

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Verification Report", 14, 10);
    doc.text(`Verifier: ${verifierEmail}`, 14, 20);
    doc.text(`Date of Verification: ${dateOfVerify}`, 14, 30);

    const tableColumn = ["Item No", "Status", "Remarks", "Date of Verify"];
    const tableRows = reports.map(report => [
      report.item_no,
      report.status,
      report.remarks,
      new Date(report.date_of_verify).toLocaleDateString("en-GB"),
    ]);

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 40 });
    doc.save("Verification_Report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      reports.map(report => ({
        "Item No": report.item_no,
        "Status": report.status,
        "Remarks": report.remarks,
        "Date of Verify": new Date(report.date_of_verify).toLocaleDateString("en-GB"),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Verification Report");
    XLSX.writeFile(workbook, "Verification_Report.xlsx");
  };

  return (
    <div className="sdstocks-container">
      <Sidebarprincipalreport sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />
      <div className="sdmain-content">
        <header className="report-header">
          <h2>Verification Report</h2>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search Item No"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter-btn" onClick={toggleFilterMenu}><FaFilter /> Filter</button>
          <button className="export-btn" onClick={toggleExportMenu}>Export</button>
          {exportOpen && (
            <div className="export-menu">
              <Button onClick={exportToPDF}>Export as PDF</Button>
              <Button onClick={exportToExcel}>Export as Excel</Button>
            </div>
          )}
          <div className="header-icons">
            <FaBell className="notification-icon" />
            <AccountMenu />
          </div>
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Item No</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Date of Verify</th>
              </tr>
            </thead>
            <tbody>
              {reports.filter(report => report.item_no.toString().includes(searchTerm)).map((report) => (
                <tr key={`${report.item_no}-${report.date_of_verify}`}>
                  <td>{report.item_no}</td>
                  <td>{report.status}</td>
                  <td>{report.remarks}</td>
                  <td>{new Date(report.date_of_verify).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reportdetails;
