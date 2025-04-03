import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./reportlist.css";
import { useNavigate } from "react-router-dom";

const Reportlist = () => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = sessionStorage.getItem("token");
                if (!token) {
                    console.error("❌ No token found. User is not authenticated.");
                    return;
                }

                const decoded = jwtDecode(token);
                const userEmail = decoded.email;

                // ✅ Fetch notifications
                const response = await axios.get("http://localhost:5000/api/fetchreport", {
                    params: { receiver: userEmail },
                    headers: { Authorization: `Bearer ${token}` } // ✅ Include token in request
                });

                console.log("🔍 Fetched Notifications:", response.data.data);
                setNotifications(response.data.data);
            } catch (error) {
                console.error("❌ Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const handleview = async (notifId) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.error("❌ No token found. User is not authenticated.");
                return;
            }
            navigate(`/reportverify?notifId=${notifId}`);
            await axios.post(
                "http://localhost:5000/api/report/reportviews",
                { notifId },
                { headers: { Authorization: `Bearer ${token}` } } // ✅ Include token
            );
            
            //navigate(`/reportverify/${notifId}`);
            setNotifications(notifications.filter((n) => n._id !== notifId)); // Remove from UI
            
            console.log(`✅ Notification ${notifId} accepted.`);
        } catch (error) {
            console.error("❌ Error accepting notification:", error);
        }
    };


    
    return (
        <div className="pnotidashboard">

            {/* Notifications Panel */}
            <div className="pnotinotification-panel">
                <h2>Reports</h2>
                
                
                    <ul>

                        {notifications.map((notif,index) => (
                            notif.type === "verifier_report" ? (
                                <li key={ `${notif._id}-${index}`} className="pnotinotification-item">
                                    <div>
                                        <strong>VERIFICATION REPORT BY VERIFIER</strong><br />
                                        <strong>verifier name:</strong> {notif.verifier_name} <br />
                                        <strong>verifier email:</strong> {notif.verifier_email} <br />
                                        <strong>Premise:</strong> {notif.premise} <br />
                                        <strong>Verify Date:</strong> {new Date(notif.verify_date).toLocaleDateString()} <br />

                                    </div>
                                    <div className="pnotibtn-group">
                                        <button className="pnotiaccept-btn" onClick={() => handleview(notif._id)}>📄 View Report</button>
                                    </div>
                                </li>
                            ) : null
                        ))}

                    </ul>
            </div>
        </div>
    );
};

export default Reportlist;