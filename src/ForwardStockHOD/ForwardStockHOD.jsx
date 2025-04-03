import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, MenuItem, Select, InputLabel, FormControl, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import './ForwardStockHOD.css';

const ForwardStockHOD = () => {
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        sl_no: '',
        indent_no: '',
        item_name: '',
        quantity: '',
        price: '',
        date_of_purchase: '',
        premise: '',
    });

    const [message, setMessage] = useState('');
    const [inventoryList, setInventoryList] = useState([]);
    const [availableStock, setAvailableStock] = useState([]);

    // Fetch available stock when component loads
    useEffect(() => {
        const fetchAvailableStock = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/fetch-stock");
                console.log("Fetched stock data:", response.data);
                if (response.data.length > 0) {
                    const stockData = response.data[0];
                    setFormData({
                        sl_no: stockData.sl_no,
                        indent_no: stockData.indent_no,
                        item_name: stockData.item_name || "",  // Ensure item_name is filled
                        price: stockData.price,
                        date_of_purchase: stockData.date_of_purchase
                            ? new Date(stockData.date_of_purchase).toISOString().split('T')[0]
                            : '',
                        quantity: stockData.remaining,
                        premise: ''
                    });
                }
                setAvailableStock(response.data);
            } catch (error) {
                console.error("Error fetching stock:", error);
                setMessage("Failed to fetch available stock.");
            }
        };

        fetchAvailableStock();
    }, []);

    // Fetch room names for premise dropdown
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/fetch-premises");
                setInventoryList(response.data);
            } catch (error) {
                console.error("Error fetching inventory:", error);
            }
        };

        fetchInventory();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedStock = {
            sl_no: parseInt(formData.sl_no, 10),
            indent_no: formData.indent_no,
            item_name: formData.item_name.trim(),
            quantity: parseInt(formData.quantity, 10),
            price: parseFloat(formData.price),
            date_of_purchase: formData.date_of_purchase,
            premise: formData.premise,
            sender: "hod@example.com"
        };

        if (!updatedStock.item_name || !updatedStock.premise) {
            setMessage("Item Name and Premise are required.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/forward-stock-hod", updatedStock);
            alert("Stock Forwarded Successfully!");
            navigate('/Hoddash');
        } catch (error) {
            console.error("Error forwarding stock:", error);
            setMessage(error.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="forward-container">
            <h1>Forward Stock</h1>
            {message && <p className="message">{message}</p>}

            <form className="forward-form" onSubmit={handleSubmit}>
                <TextField label="Serial No" variant="outlined" name="sl_no" value={formData.sl_no} required disabled />
                <TextField label="Indent No" variant="outlined" name="indent_no" value={formData.indent_no} required disabled />
                <TextField label="Item Name" variant="outlined" name="item_name" value={formData.item_name} onChange={handleChange} required />
                <TextField label="Quantity" type="number" variant="outlined" name="quantity" value={formData.quantity} onChange={handleChange} required />
                <TextField label="Price" type="number" variant="outlined" name="price" value={formData.price} required disabled />
                <TextField label="Date of Purchase" type="date" variant="outlined" name="date_of_purchase" value={formData.date_of_purchase} required disabled />
                
                <FormControl variant="outlined" fullWidth>
                    <InputLabel>Premise</InputLabel>
                    <Select name="premise" value={formData.premise} onChange={handleChange} label="Premise">
                        {inventoryList.map((room) => (
                            <MenuItem key={room._id} value={room.name}>{room.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" color="primary" endIcon={<SendIcon />}>Forward</Button>
            </form>
        </div>
    );
};

export default ForwardStockHOD;
