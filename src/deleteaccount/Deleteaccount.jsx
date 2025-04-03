import React, { useState } from "react";
import "./deleteacc.css";
import loginimage from "../assets/loginimg.png";

function Deleteacc() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error deleting account");
      console.error("Error:", error);
    }
  };

  return (
    <div className="deleteacc-page">
      <div className="deleteacc-container">
        <div className="dc-form-container">
          <div className="dc-header">
            <div className="box"></div>
            <h1>Remove Account</h1>
          </div>
          <form onSubmit={handleSubmit} className="dc-form">
            <div className="dc-input">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="delete-button">
              <button type="submit">Delete Account</button>
            </div>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
        <div className="dc-image-container">
          <img src={loginimage} alt="Illustration" className="dc-image" />
        </div>
      </div>
    </div>
  );
}

export default Deleteacc;

