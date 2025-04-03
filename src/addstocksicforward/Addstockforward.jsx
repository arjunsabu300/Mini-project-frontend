import React, { useState, useEffect } from "react";
import "./Addstock.css";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AddStockforward = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [Email, setEmail] = useState(null);
  const [role, setRole] = useState("");
  const [inventoryList, setInventoryList] = useState([]);
  const [formData, setFormData] = useState({
    indent_no: "",
    sl_no: "",
    name: "",
    qty: "",
    warranty_period: "",
    date_of_purchase: "",
    price: "",
    specification: "",
    type: "",
    inventory: "",
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email);
        setRole(decoded.designation);
      } catch (error) {
        console.error("Invalid Token:", error);
      }
    }

    if (role.toLowerCase() === "furniture-custodian") {
      axios
        .get("http://localhost:5000/api/Room/allinventorys")
        .then((response) => {
          setInventoryList(response.data);
        })
        .catch((error) => {
          console.error("Error fetching inventory:", error);
        });
    }

    const queryParams = new URLSearchParams(location.search);
    const notifId = queryParams.get("notifId");

    if (notifId) {
      axios
        .get(`http://localhost:5000/api/get-stock-details?notifId=${notifId}`)
        .then((response) => {
          const data = response.data;
          setFormData((prevState) => ({
            ...prevState,
            ...data,
            date_of_purchase: data.date_of_purchase
              ? data.date_of_purchase.split("T")[0]
              : "",
          }));
        })
        .catch((error) => {
          console.error("Error fetching stock details:", error);
        });
    }
  }, [location, role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role.toLowerCase() === "furniture-custodian" && !formData.inventory) {
      alert("Please select an inventory before adding stock.");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! No token found.");
      return;
    }

    const dbData = { ...formData, Email };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/add-stock-sic",
        dbData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token is included in headers
          },
        }
      );
      alert("Stock Added Successfully!");
      navigate("/Sicdash");
    } catch (error) {
      console.error("Error forwarding stock:", error);
    }
  };

  return (
    <div className="addstock-container">
      <h1>Add Stock</h1>
      <form className="addstock-form" onSubmit={handleSubmit}>
        <TextField
          label="Indent No"
          variant="outlined"
          name="indent_no"
          value={formData.indent_no}
          onChange={handleChange}
          required
        />
        <TextField
          label="Serial No"
          variant="outlined"
          name="sl_no"
          value={formData.sl_no}
          onChange={handleChange}
          required
        />
        <TextField
          label="Name"
          variant="outlined"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Type"
          variant="outlined"
          name="type"
          value={formData.type}
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
          label="Warranty Period"
          variant="outlined"
          name="warranty_period"
          value={formData.warranty_period}
          onChange={handleChange}
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
          label="Specification"
          variant="outlined"
          name="specification"
          value={formData.specification}
          onChange={handleChange}
          required
        />
        <TextField
          label="Quantity"
          type="number"
          variant="outlined"
          name="qty"
          value={formData.qty}
          onChange={handleChange}
          required
        />
        {role.toLowerCase() === "furniture-custodian" && (
          <select
            className="selectpremise"
            name="inventory"
            value={formData.inventory}
            onChange={handleChange}
            required
          >
            <option value="">Select Inventory</option>
            {inventoryList.map((room) => (
              <option key={room._id} value={room.name}>
                {room.name}
              </option>
            ))}
          </select>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
        >
          Add
        </Button>
      </form>
    </div>
  );
};

export default AddStockforward;
