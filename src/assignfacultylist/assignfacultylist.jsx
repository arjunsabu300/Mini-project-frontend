import React, { useState, useEffect } from "react";
import "./assignfacultylist.css";
import { FaSearch, FaUser, FaBars, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import { jwtDecode } from "jwt-decode";
import Sidebarprincipalreport from "../assets/sidebarreport";
import Button from '@mui/material/Button';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Link} from "react-router-dom"; 
import axios from "axios";

const Assignedfacultydetails = () => {
  const [faculties, setFaculties] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExportMenu = () => setExportOpen(!exportOpen);

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
    const fetchFacultyDetails = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/faculty/facultylist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch stock details");

        const data = await response.json();
        console.log(data);
        setFaculties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyDetails();
  }, []);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Assigned Faculty Details", 14, 10);
    const tableColumn = ["Faculty Name", "Faculty Email", "Department", "Premise of verification", "Assigned Date", "Last Date", "Status","Verified Date"];
    const tableRows = faculties.map(faculty => [
      faculty.facultyName,
      faculty.facultyemail,
      faculty.department,
      faculty.premise,
      faculty.assigned_date,
      faculty.last_date,
      faculty.status,
      new Date(faculty.verified_date).toLocaleDateString("en-GB"),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 }, // Adjust font size for better readability
    columnStyles: {
      0: { cellWidth: 30 }, // Faculty Name
      1: { cellWidth: 50 }, // Faculty Email
      2: { cellWidth: 25 }, // Department
      3: { cellWidth: 40 }, // Premise
      4: { cellWidth: 30 }, // Assigned Date
      5: { cellWidth: 30 }, // Last Date
      6: { cellWidth: 30 }, // Status
      7: { cellWidth: 30 }, // Verified Date
    },
    margin: { top: 30 }, // Adjust margins
    theme: "grid", // Grid style for clarity
    });

    doc.save("AssignedFaculty_Details.pdf");
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      faculties.map(faculty => ({
        "Faculty Name": faculty.facultyName,
        "Faculty Email": faculty.facultyemail,
        "Department": faculty.department,
        "Premise": faculty.premise,
        "Assigned Date": new Date(faculty.assigned_date).toLocaleDateString("en-GB"),
        "Last Date": new Date(faculty.last_date).toLocaleDateString("en-GB"),
        "Status": faculty.status,
        "Verified Date": new Date(faculty.verified_date).toLocaleDateString("en-GB"),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AssignedFacultyDetails");

    XLSX.writeFile(workbook, "AssignedFaculty_Details.xlsx");
  };

  const filteredFacultys = faculties.filter((stock) =>
    stock.facultyName.toString().includes(searchTerm)
  );

  return (
    <div className="sdstocks-container">
      <Sidebarprincipalreport sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="asdheaderstockdetails">
          <h2>Assigned Faculty List</h2>
          <div className="asdsearch-bar">
            <FaSearch className="asdsearch-icon" />
            <input
              type="text"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input className="adatetype" type="date" />

          <div className="anewbuttons">
            <button className="asdexport-btn" onClick={toggleExportMenu}>
              Export
            </button>
          </div>

          {exportOpen && (
            <div className="asdexport-menu">
              <Button className="aexporttopdfbtn" onClick={exportToPDF}>Export as PDF</Button>
              <Button className="aexporttoexcelbtn" onClick={exportToExcel}>Export as Excel</Button>
            </div>
          )}

          <div className="asdheader-icons">
            <FaBell className="asdnotification-icon" />
            <div className="asduser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        <table className="asdstock-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Faculty Email</th>
              <th>Department</th>
              <th>Premise</th>
              <th>Assigned Date </th>
              <th>Last Date</th>
              <th>Status</th>
              <th>Verified Date</th>
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
            ) : filteredFacultys.length === 0 ? (
              <tr>
                <td colSpan="8">No assigned faculty found</td>
              </tr>
            ) : (
              filteredFacultys.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.facultyName}</td>
                  <td>{stock.facultyemail}</td>
                  <td>{stock.department}</td>
                  <td>{stock.premise}</td>
                  <td>{stock.assigned_date}</td>
                  <td>{stock.last_date}</td>
                  <td>
                    <span className={`asdstatus-label ${stock.status === "Completed" ? "completed" : "pending"}`}>
                      {stock.status}
                    </span>
                  </td>
                  <td>{stock.verified_date ? new Date(stock.verified_date).toLocaleDateString("en-GB") : "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignedfacultydetails;
