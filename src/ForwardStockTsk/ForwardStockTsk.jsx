import React, { useState } from "react";
import "./ForwardStockTsk.css"
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForwardStockTsk = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sl_no: "",
    indent_no: "",
    date_of_purchase: "",
    price: "",
    quantity: "", // ✅ Added Quantity field
    department: "CSE",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("Unauthorized: No token found. Please log in again.");
      console.error("No token found");
      return;
    }

    const dbData = {
      ...formData,
      sl_no: parseInt(formData.sl_no, 10), // Ensure sl_no is an integer
      price: parseFloat(formData.price), // Ensure price is a number
      quantity: parseInt(formData.quantity, 10), // ✅ Ensure quantity is an integer
      department: "",
    };

    if (isNaN(dbData.sl_no) || isNaN(dbData.price) || isNaN(dbData.quantity)) {
      setMessage("Serial Number, Price, and Quantity must be valid numbers.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/forward-stock-tsk",
        dbData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
      alert("Stock Forwarded Successfully!");
      navigate("/Tskdash");
    } catch (error) {
      console.error("❌ Error forwarding stock:", error);
      setMessage(error.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <div className="forward-container">
      <h1>Forward Stock</h1>
      {message && <p className="message">{message}</p>}
      <form className="forward-form" onSubmit={handleSubmit}>
        <TextField
          label="Serial No"
          variant="outlined"
          name="sl_no"
          value={formData.sl_no}
          onChange={handleChange}
          required
        />

        <TextField
          label="Indent No"
          variant="outlined"
          name="indent_no"
          value={formData.indent_no}
          onChange={handleChange}
          required
        />

        <TextField
          label="Date of Purchase"
          type="date"
          variant="outlined"
          name="date_of_purchase"
          value={formData.date_of_purchase}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Price"
          type="number"
          variant="outlined"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <TextField
          label="Quantity" // ✅ Added Quantity field
          type="number"
          variant="outlined"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <TextField
          label="Department"
          variant="outlined"
          name="department"
          value="CSE"
          disabled
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
        >
          Forward
        </Button>
      </form>
    </div>
  );
};

export default ForwardStockTsk;
