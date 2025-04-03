import React, { useState,useEffect } from 'react';
import './Addstock.css';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from "jwt-decode";

const AddStocksic = () => {
    const navigate = useNavigate();
    const [Email, setEmail] = useState("");
    const [role,setRole]=useState("");
    const [inventoryList, setInventoryList] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        sl_no: '',
        indent_no: '',
        qty: '',
        warranty_period: '',
        date_of_purchase: '',
        price: '',
        specification: '',
        type: '',
        inventory: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
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
      }, []);

      useEffect(() => {
        const fetchInventory = async () => {
          try {
            const response = await axios.get("http://localhost:5000/api/Room/allinventorys");
            setInventoryList(response.data); // Set inventory data from the backend
          } catch (error) {
            console.error("Error fetching inventory:", error);
          }
        };
        
        fetchInventory();
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = sessionStorage.getItem("token"); 
        if (!token) {
            alert("Unauthorized! No token found.");
            return;
        }

        const dbData = { ...formData, Email};

        try {
            const response = await axios.post(
                'http://localhost:5000/api/add-stock-sic', 
                dbData, 
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Pass token in headers
                    }
                }
            );
            setMessage(response.data.message);
            alert("Stock Added Successfully!");
            navigate('/Sicdash');
        } catch (error) {
            console.error("Error forwarding stock:", error);
            setMessage(error.response?.data?.error || "Something went wrong!");
        }
    };

    return (
        <div className="addstock-container">
            <h1>Add Stock</h1>
            {message && <p className="addstockmessage">{message}</p>}
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
                {role.toLowerCase() !== "furniture-custodian" && (
                <TextField 
                    label="Warranty Period" 
                    variant="outlined" 
                    name="warranty_period" 
                    value={formData.warranty_period} 
                    onChange={handleChange} 
                    required 
                />
                )}
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
                    label="specification" 
                    variant="outlined" 
                    name="specification" 
                    value={formData.specification} 
                    onChange={handleChange} 
                    required 
                />
                <TextField 
                    label="Quantity" 
                    variant="outlined" 
                    name="qty" 
                    type="number"
                    value={formData.qty} 
                    onChange={(e) => handleChange({ 
                        target: { name: 'qty', value: parseInt(e.target.value, 10) || '' }
                    })} 
                    required 
                />
                {role.toLowerCase() === "furniture-custodian" && (
                        <select className='selectpremise' 
                            name="inventory" 
                            value={formData.inventory} 
                            onChange={handleChange} 
                            required
                        >
                        <option value="">Select Inventory</option>
                        {inventoryList.map((room) => (
                        <option key={room._id} value={room.name}>{room.name}</option>
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

export default AddStocksic;
