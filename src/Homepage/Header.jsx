import React from "react";
import "./Homedes.css";
import otherImage from "../assets/Desktopimg.png";


function Header() {
  return (
    <>
        <div className="homeheader">
            <h1 className="Left-text">Track,<br />Transfer,<br />Verify <br />– All in One Place</h1>
            <img className="desktopimage" src={otherImage} alt="Header Illustration" />
        </div>
        <div>
            <p className="small-left-text">An innovative system to efficiently manage, <br />verify, and maintain inventory,
            <br />designed for seamless operations and <br />enhanced productivity.</p>
        </div>
    </>
            
       
  );
}

export default Header;
