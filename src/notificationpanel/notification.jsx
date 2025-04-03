import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./NotificationPanel.css";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
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

                const response = await axios.get("http://localhost:5000/api/fetch-notifications", {
                    params: { receiver: userEmail },
                    headers: { Authorization: `Bearer ${token}` },
                });

                let fetchedNotifications = response.data.data;
                console.log("📩 Raw Notifications:", fetchedNotifications);

                // Filter valid notifications
                const validNotifications = fetchedNotifications.filter((notif) => {
                    if (notif.type === "tskstockforward") {
                        return notif.indent_no && notif.sl_no && notif.quantity;
                    } 
                    if (notif.type === "hodstockaccept") {
                        return notif.indent_no && notif.sl_no;
                    } 
                    if (notif.type === "hodstockforward") {
                        return notif.indent_no && notif.quantity && notif.message;
                    }
                    if (notif.type === "sicstockaccept") {
                        return notif.indent_no && notif.quantity && notif.message;
                    }
                    if (notif.type === "hodstockreject") {
                        return notif.indent_no && notif.sl_no && notif.message;
                    }
                    if (notif.type === "sicstockreject") {
                        return notif.indent_no && notif.message;
                    }
                    if (notif.type === "principalfacultyassign") {
                        return notif.facultyemail && notif.last_date;
                    }
                    if (notif.type === "verifier_report") {
                        return notif.verifier_email && notif.verifier_name && notif.verify_date;
                    }
                    if (notif.type === "reportapprove") {
                      return notif.sender && notif.type;
                  }
                    if (notif.type === "stockhandover") {
                      return notif.room_no && notif.sender;
                      
                  }
                  if (notif.type === "stocktransfer") {
                    return notif.item_no && notif.sender;
                    
                }
                    return false;
                });

                console.log("✅ Filtered Notifications:", validNotifications);
                setNotifications(validNotifications);
            } catch (error) {
                console.error("❌ Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const handleAddacc = async (notifId) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.error("❌ No token found. User is not authenticated.");
                return;
            }
            navigate(`/register?notifId=${notifId}`);

            await axios.post(
                "http://localhost:5000/api/Add-account",
                { notifId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotifications(notifications.filter((n) => n._id !== notifId));
            console.log(`✅ Notification ${notifId} accepted.`);
        } catch (error) {
            console.error("❌ Error accepting notification:", error);
        }
    };

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
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotifications(notifications.filter((n) => n._id !== notifId));
            console.log(`✅ Notification ${notifId} viewed.`);
        } catch (error) {
            console.error("❌ Error viewing notification:", error);
        }
    };

    const handleAccept = async (notifId) => {
      try {
          const token = sessionStorage.getItem("token");
          if (!token) {
              console.error("❌ No token found. User is not authenticated.");
              return;
          }

          await axios.post(
              "http://localhost:5000/api/accept-notification",
              { notifId },
              { headers: { Authorization: `Bearer ${token}` } } // ✅ Include token
          );

          setNotifications(notifications.filter((n) => n._id !== notifId)); // Remove from UI
          console.log(`✅ Notification ${notifId} accepted.`);
      } catch (error) {
          console.error("❌ Error accepting notification:", error);
      }
  };

  const handleReject = async (notifId) => {
      try {
          const token = sessionStorage.getItem("token");
          if (!token) {
              console.error("❌ No token found. User is not authenticated.");
              return;
          }

          await axios.post(
              "http://localhost:5000/api/reject-notification",
              { notifId },
              { headers: { Authorization: `Bearer ${token}` } } // ✅ Include token
          );

          setNotifications(notifications.filter((n) => n._id !== notifId)); // Remove from UI
          console.log(`❌ Notification ${notifId} rejected.`);
      } catch (error) {
          console.error("❌ Error rejecting notification:", error);
      }
  };

  const handleMarkRead = async (notifId) => {
      try {
        await axios.post("http://localhost:5000/api/mark-notification-read", {
          notifId,
        });
        setNotifications(notifications.filter((n) => n._id !== notifId));
      } catch (error) {
        console.error("❌ Error marking notification as read:", error);
      }
    };
  
    const handleAction = async (notifId, action) => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found. User is not authenticated.");
          return;
        }
  
        const endpoint =
          action === "accept"
            ? "http://localhost:5000/api/accept-notification-h"
            : "http://localhost:5000/api/reject-notification-h";
  
        await axios.post(
          endpoint,
          { notifId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setNotifications(notifications.filter((n) => n._id !== notifId));
      } catch (error) {
        console.error(`❌ Error ${action}ing notification:`, error);
      }
    };
  
    const handleHodStockAction = async (notifId, action) => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found. User is not authenticated.");
          return;
        }
  
        if (action === "accept") {
          axios
            .post("http://localhost:5000/api/create-sicstockaccept", { notifId })
            .then((response) => {
              console.log(
                "✅ SicStockAccept Notification Created:",
                response.data
              );
            })
            .catch((error) => {
              console.error(
                "❌ Error creating SicStockAccept notification:",
                error
              );
            })
            .finally(() => {
              navigate(`/addstockforward?notifId=${notifId}`);
            });
        } else {
          //this is to reject forwarded stock by hod by SIC even though api call is called hod-reject
          await axios.post(
            "http://localhost:5000/api/hod-reject-notification",
            { notifId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setNotifications(notifications.filter((n) => n._id !== notifId));
        }
      } catch (error) {
        console.error(`❌ Error ${action}ing HOD stock notification:`, error);
      }
    };

    const handleActions = async (notifId, action, type, additionalData) => {
      try {
          const token = sessionStorage.getItem("token");
          if (!token) {
              console.error("❌ No token found. User is not authenticated.");
              return;
          }

          console.log(`📩 Handling action for notifId: ${notifId}, action: ${action}, type: ${type}, data:`, additionalData);

          let endpoint = "";
          let payload = { notifId };

          if (type === "stocktransfer") {
              endpoint = action === "accept" 
                  ? "http://localhost:5000/api/accept-stock-transfer"
                  : "http://localhost:5000/api/reject-stock-transfer";
              payload.item_no = additionalData;
          } else if (type === "stockhandover") {
              endpoint = action === "accept" 
                  ? "http://localhost:5000/api/accept-stock-handover"
                  : "http://localhost:5000/api/reject-stock-handover";
              payload.room_no = additionalData;
          }

          const response = await axios.post(endpoint, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });

          console.log(`✅ Notification ${notifId} ${action}ed.`, response.data);

          // ✅ Remove handled notification from UI
          if (type === "stocktransfer") {
            setNotifications(notifications.filter((n) => n._id !== notifId));
          } else if (type === "stockhandover") {
            setNotifications(notifications.filter((n) => n._id !== notifId));
          }
      } catch (error) {
          console.error(`❌ Error ${action}ing notification:`, error);
      }
  };

    return (
        <div className="notidashboard">
            <div className="notisidebar">
                <div className="notisidebar-item active">🔔 Notifications</div>
            </div>

            <div className="notinotification-panel">
                <h2>Notifications</h2>

                <div className="notinotification-list">
                    {notifications.length === 0 ? (
                        <p className="empty-message">No new notifications</p>
                    ) : (
                        <ul>
                            {notifications.map((notif) => (
                                <li key={notif._id} className="notinotification-item">
                                    {notif.type === "principalfacultyassign" && (
                                        <div>
                                            <strong>VERIFIER ASSIGNED BY PRINCIPAL</strong><br />
                                            <strong>Faculty Name:</strong> {notif.facultyname} <br />
                                            <strong>Faculty Email:</strong> {notif.facultyemail} <br />
                                            <strong>Premise:</strong> {notif.premise} <br />
                                            <strong>Last Date:</strong> {new Date(notif.last_date).toLocaleDateString()} <br />
                                            <div className="notibtn-group">
                                                <button className="notiaccept-btn" onClick={() => handleAddacc(notif._id)}>✅ Add Account</button>
                                            </div>
                                        </div>
                                    )}

                                    {notif.type === "verifier_report" && (
                                        <div>
                                            <strong>VERIFICATION REPORT BY VERIFIER</strong><br />
                                            <strong>Verifier Name:</strong> {notif.verifier_name} <br />
                                            <strong>Verifier Email:</strong> {notif.verifier_email} <br />
                                            <strong>Premise:</strong> {notif.premise} <br />
                                            <strong>Verify Date:</strong> {new Date(notif.verify_date).toLocaleDateString()} <br />
                                            <div className="notibtn-group">
                                                <button className="notiaccept-btn" onClick={() => handleview(notif._id)}>📄 View Report</button>
                                            </div>
                                        </div>
                                    )}

{notif.type === "tskstockforward" && (
                        <div>
                          <strong>TSK FORWARDING STOCK</strong>
                          <br />
                          <strong>Indent No:</strong> {notif.indent_no} <br />
                          <strong>Sl No:</strong> {notif.sl_no} <br />
                          <strong>Quantity:</strong> {notif.quantity} <br />
                          <div className="notibtn-group">
                            <button
                              className="notiaccept-btn"
                              onClick={() => handleAction(notif._id, "accept")}
                            >
                              ✅ Accept
                            </button>
                            <button
                              className="notidecline-btn"
                              onClick={() => handleAction(notif._id, "reject")}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      )}

{notif.type === "hodstockaccept" && (
                        <div>
                          <strong>CSE HOD accepted the Stock</strong>
                          <br />
                          <strong>Indent No:</strong> {notif.indent_no} <br />
                          <strong>Sl No:</strong> {notif.sl_no} <br />
                          <button
                            className="notimark-btn"
                            onClick={() => handleMarkRead(notif._id)}
                          >
                            ✔️
                          </button>
                        </div>
                      )}
    
                      {notif.type === "hodstockforward" && (
                        <div>
                          <strong>HOD FORWARDING STOCK</strong>
                          <br />
                          <strong>Indent No:</strong> {notif.indent_no} <br />
                          <strong>Quantity:</strong> {notif.quantity} <br />
                          <strong>Message:</strong> {notif.message} <br />
                          <div className="notibtn-group">
                            <button
                              className="notiaccept-btn"
                              onClick={() =>
                                handleHodStockAction(notif._id, "accept")
                              }
                            >
                              ✅ Accept
                            </button>
                            <button
                              className="notidecline-btn"
                              onClick={() =>
                                handleHodStockAction(notif._id, "reject")
                              }
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      )}
                      {notif.type === "sicstockaccept" && (
                        <div>
                          <strong>STOCK ALLOCATED SUCCESSFULLY</strong>
                          <br />
                          <strong>Indent No:</strong> {notif.indent_no} <br />
                          <strong>Quantity:</strong> {notif.quantity} <br />
                          <strong>Receiver:</strong> {notif.receiver} <br />
                          <button
                            className="notimark-btn"
                            onClick={() => handleMarkRead(notif._id)}
                          >
                            ✔️
                          </button>
                        </div>
                      )}
                      {notif.type === "hodstockreject" && (
                        <div>
                          <strong>STOCK REJECTED BY HOD. FORWARD AGAIN</strong>
                          <br />
                          <strong>Indent No:</strong> {notif.indent_no} <br />
                          <strong>SL No:</strong> {notif.sl_no} <br />
                          <button
                            className="notimark-btn"
                            onClick={() => handleMarkRead(notif._id)}
                          >
                            ✔️
                          </button>
                        </div>
                      )}
                      {notif.type === "sicstockreject" && (
                        <div>
                          <strong>STOCK REJECTED BY SIC</strong>
                          <br />
                          <strong>Indent No:</strong> {notif.indent_no} <br />
                          <strong>Quantity:</strong> {notif.quantity} <br />
                          <strong>SIC:</strong> {notif.sender} <br />
                          <button
                            className="notimark-btn"
                            onClick={() => handleMarkRead(notif._id)}
                          >
                            ✔️
                          </button>
                        </div>
                      )}

                        {notif.type === "stockhandover" && (
                        <div>
                          <strong>Stock Handover Notification</strong>
                          <br />
                          <strong>Sender:</strong> {notif.sender} <br />
                          <strong>Room_no:</strong> {notif.room_no} <br />
                          <strong>Room name:</strong> {notif.room_name} <br />
                          <div className="notibtn-group">
                                            <button className="notiaccept-btn" onClick={() => handleActions(notif._id, "accept", "stockhandover", notif.room_no)}>
                                                ✅ Accept Handover
                                            </button>
                                            <button className="notidecline-btn" onClick={() => handleActions(notif._id, "reject", "stockhandover", notif.room_no)}>
                                                ❌ Reject Handover
                                            </button>
                                        </div>
                        </div>
                      )}

                        {notif.type === "stocktransfer" && (
                        <div>
                          <strong>Stock Transfer Notification</strong>
                          <br />
                          <strong>Sender:</strong> {notif.sender}  is transfering stock <br />
                          <strong>Item no:</strong> {notif.item_no} <br />
          
                          <div className="notibtn-group">
                                            <button className="notiaccept-btn" onClick={() => handleActions(notif._id, "accept", "stocktransfer", notif.item_no)}>
                                                ✅ Accept Transfer
                                            </button>
                                            <button className="notidecline-btn" onClick={() => handleActions(notif._id, "reject", "stocktransfer", notif.item_no)}>
                                                ❌ Reject Transfer
                                            </button>
                                        </div>
                        </div>
                      )}

                      {/* new */}
                      {notif.type === "reportapprove" && (
                        <div>
                          <strong>VERIFICATION REPORT APPROVED </strong>
                          <br />
                          <strong>Eligible items may be cleared as needed</strong>
                          <br/>
                          <strong>From Principal </strong>
                          <br/>
                          <button
                            className="notimark-btn"
                            onClick={() => handleMarkRead(notif._id)}
                          >
                            ✔️
                          </button>
                        </div>
                      )}
                                 



                                </li>
                            ))}

                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
