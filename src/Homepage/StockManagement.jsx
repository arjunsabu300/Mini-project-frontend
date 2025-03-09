import React from "react";
import "./Homedes.css";
import { ArrowRight } from "lucide-react";
import stockimage from "../assets/stockimg.png";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
function StockManagement() {
  return (
    <>
    <div className="stock-management">
      <div className="stock-mangsec">
        <h1>STOCK <br />MANAGEMENT <br />SYSTEM</h1>
        <br />
        
        <img className="stockimage" src={stockimage} alt="" />
        
      </div>
      <p>Effortlessly manage and maintain inventory with a <br />streamlined, user-friendly system designed for <br />accuracy and efficiency</p>
      
      <div className="buttons">
        <button disabled className="get-started">GET STARTED<ArrowRight size={25} style={{ marginLeft: "0.5rem" }} /></button>
        <Link to="/login">
          <Button variant="contained" className="loginbtn">Login</Button>
        </Link>
      </div>
      </div>
    </>
  );
}

export default StockManagement;
