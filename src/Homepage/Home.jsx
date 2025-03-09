// src/homepage/Homepage.jsx
import React from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import StockManagement from "./StockManagement";
import "./Homedes.css"; 

function Home() {
  return (
    <div className="homepage">
      <Navbar />
      <Header />
      <StockManagement />
    </div>
  );
}

export default Home;
