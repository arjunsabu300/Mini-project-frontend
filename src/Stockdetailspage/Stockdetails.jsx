import React, { useState, useEffect } from "react";
import "./Stockdetails.css";
import { FaSearch, FaUser, FaBars, FaBell, FaFilter } from "react-icons/fa";
import AccountMenu from "../assets/Usermenu";
import { jwtDecode } from "jwt-decode";
import Sidebars from "../assets/sidebar";
import Button from '@mui/material/Button';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Link} from "react-router-dom"; 

const Stockdetails = () => {
  const [stocks, setStocks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFilterMenu = () => setFilterOpen(!filterOpen);
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
    const fetchStockDetails = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/stock/stockdetails", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch stock details");

        const data = await response.json();
        setStocks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, []);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Stock Details", 14, 10);
    const tableColumn = ["Item No", "Indent No", "Item Name", "Date of Invoice", "Description", "Price", "Status"];
    const tableRows = stocks.map(stock => [
      stock.item_no,
      stock.indent_no,
      stock.item_name,
      new Date(stock.date_of_invoice).toLocaleDateString(),
      stock.description,
      stock.price,
      stock.status,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Stock_Details.pdf");
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      stocks.map(stock => ({
        "Item No": stock.item_no,
        "Indent No": stock.indent_no,
        "Item Name": stock.item_name,
        "Date of Invoice": new Date(stock.date_of_invoice).toLocaleDateString(),
        "Description": stock.description,
        "Price": stock.price,
        "Status": stock.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StockDetails");

    XLSX.writeFile(workbook, "Stock_Details.xlsx");
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.item_no.toString().includes(searchTerm)
  );

  return (
    <div className="sdstocks-container">
      <Sidebars sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <div className="sdmain-content">
        <header className="sdheaderstockdetails">
          <h2>Stocks</h2>
          <div className="sdsearch-bar">
            <FaSearch className="sdsearch-icon" />
            <input
              type="text"
              placeholder="Search Item ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input className="datetype" type="date" />
          <button className="sdfilter-btn" onClick={toggleFilterMenu}>
            <FaFilter /> Filter
          </button>

          <div className="newbuttons">
            <button className="sdexport-btn" onClick={toggleExportMenu}>
              Export
            </button>

            {role && role.toLowerCase() === "stock-in-charge" && (
              <li>
                <Link to="/addstocksic">
                  <button className="sdnew-item-btn">+ New Items</button>
                </Link>
              </li>
            )}
          </div>


          {exportOpen && (
            <div className="sdexport-menu">
              <Button className="exporttopdfbtn" onClick={exportToPDF}>Export as PDF</Button>
              <Button className="exporttoexcelbtn" onClick={exportToExcel}>Export as Excel</Button>
            </div>
          )}

          <div className="sdheader-icons">
            <FaBell className="sdnotification-icon" />
            <div className="sduser-menu">
              <AccountMenu />
            </div>
          </div>
        </header>

        {filterOpen && (
          <div className="sdfilter-menu">
            <label>
              Status:
              <select>
                <option value="all">All</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </label>
            <label>
              Product:
              <select>
                <option value="all">All</option>
                <option value="CPU">CPU</option>
                <option value="Monitor">Monitor</option>
              </select>
            </label>
          </div>
        )}

        <table className="sdstock-table">
          <thead>
            <tr>
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
                <td colSpan="7">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7">Error: {error}</td>
              </tr>
            ) : filteredStocks.length === 0 ? (
              <tr>
                <td colSpan="7">No stock details found</td>
              </tr>
            ) : (
              filteredStocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.item_no}</td>
                  <td>{stock.indent_no}</td>
                  <td>{stock.item_name}</td>
                  <td>{new Date(stock.date_of_invoice).toLocaleDateString()}</td>
                  <td>{stock.description}</td>
                  <td>{stock.price}</td>
                  <td>
                    <span
                      className={`sdstatus-label ${
                        stock.status === "Working" ? "working" : "not-working"
                      }`}
                    >
                      {stock.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stockdetails;
