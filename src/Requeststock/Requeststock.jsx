import React, { useState,useEffect } from "react";
import "./StockRequest.css";
import AccountMenu from "../assets/Usermenu";
import { FaUser, FaSearch, FaBell } from "react-icons/fa";
import Sidebarprincipal from "../assets/sidebarprincipal";
import { Link ,useNavigate} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Button } from "@mui/material";

const StockRequest = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [role,setRole]=useState(null);
    const navigate=useNavigate();
    const [inventoryList, setInventoryList] = useState([]);
     const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
            department: '',
            inventory: ''
        });
    
        const handleChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        };

     useEffect(()=>{
                const token = sessionStorage.getItem("token");
                if (token) {
                    try {
                        const decoded = jwtDecode(token); // Decode token to get user info
                        setRole(decoded.designation);
                        } catch (error) {
                            console.error("Invalid Token:", error);
                        }
                    }
            },[]);
    useEffect(() => {
            const fetchInventory = async () => {
              try {
                const response = await axios.get("http://localhost:5000/api/Room/inventory");
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
    
            const dbData = { ...formData};
    
            try {
                const response = await axios.post(
                    'http://localhost:5000/api/request/details', 
                    dbData, 
                    {
                        headers: {
                            Authorization: `Bearer ${token}` // Pass token in headers
                        }
                    }
                );
                setMessage(response.data.message);
                alert("Stock Details Request Send Successfully! ✅");
                navigate('/principaldash');
            } catch (error) {
                console.error("Error forwarding stock:", error);
                setMessage(error.response?.data?.error || "Something went wrong!");
            }
        };

  return (
    <div className="srpcontainer">
      <Sidebarprincipal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />
      <main className="srpcontent">
        <header className="srpheader">
          <h2>Request Stock Report</h2>
          <div className="srpheader-icons">
          <Button onClick={handleSubmit} className='action-button' variant="contained">Request+</Button>
            <FaBell onClick={() => navigate("/notify")} className="srpicon" />
            <AccountMenu/>
          </div>
        </header>
        <div className="srptable-container">
          <div className="srptable">
          <select className='selectpremise' 
                            name="department" 
                            value={formData.department} 
                            onChange={handleChange} 
                            required
                        >
                        <option value="">Select Inventory</option>
                        <option value="cse">CSE</option>
                    </select>
          </div>
          <div className="srptable">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockRequest;
