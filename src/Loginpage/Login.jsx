import React, { useState } from "react";
import "./login.css";
import loginimage from "../assets/loginimg.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import OTP from "../assets/otpfield";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  // Handle login submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/loginauth", { email, password });
      alert(response.data.message);
      
      const token = response.data.token;
      sessionStorage.setItem("token", token);
      
      const role = response.data.designation;
      if (role.toLowerCase() === "hodcse") {
        navigate("/Hoddash");
      } else if (role.toLowerCase() === "stock-in-charge" || role.toLowerCase() === "furniture-custodian") {
        navigate("/Sicdash");
      } else if (role.toLowerCase() === "custodian") {
        navigate("/custdash");
      } else if (role.toLowerCase() === "principal") {
        navigate("/principaldash");
      } else if (role.toLowerCase() === "verifier" || role.toLowerCase() === "furniture-verifier") {
        navigate("/verifydash");
      } else if (role.toLowerCase() === "tsk") {
        navigate("/Tskdash");
      }

    } catch (error) {
      alert(error.response ? error.response.data.message : "Something went wrong");
    }
  };

  // Handle Forgot Password: Send OTP
  const handleSendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/loginauth/send-otp", { email });
      alert(response.data.message);
      setOtpSent(true);
    } catch (error) {
      alert(error.response ? error.response.data.message : "Error sending OTP");
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    try {
      console.log("OTP entered:", otp);
      const response = await axios.post("http://localhost:5000/api/loginauth/verify-otp", { email, otp });
      alert(response.data.message);
      if (response.data.success) {
        setOtpVerified(true);
      }
    } catch (error) {
      alert(error.response ? error.response.data.message : "Invalid OTP");
    }
  };

  // Handle Password Reset
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/loginauth/reset-password", { email, newPassword });
      alert(response.data.message);
      setForgotPassword(false);
      setOtpSent(false);
      setOtpVerified(false);
    } catch (error) {
      alert(error.response ? error.response.data.message : "Error resetting password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-container">
          <div className="login-header">
            <h1>{forgotPassword ? "Reset Password" : "Login"}</h1>
            <p>{forgotPassword ? "Enter your email to reset password" : "Login to your account"}</p>
          </div>

          {!forgotPassword ? (
            // Login Form
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-input">
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
              <div className="login-input password-input">
                <label htmlFor="password">Password*</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>
              <div className="login-checkbox">
                <a className="login-forgot" href="#" onClick={() => setForgotPassword(true)}>Forgot password?</a>
              </div>
              <div className="login-button">
                <button type="submit">Login</button>
              </div>
            </form>
          ) : (
            // Forgot Password Form
            <div className="forgot-password-form">
              <div className="login-input">
                <label htmlFor="email">Enter your Email*</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {!otpSent ? (
                <button className="otp-button" onClick={handleSendOtp}>Generate OTP</button>
              ) : (
                <>
                  <div className="login-input">
                    <label htmlFor="otp">Enter OTP*</label>
                    <OTP
                        separator={<span>-</span>}
                        value={otp}
                        onChange={setOtp} // Directly pass setOtp to handle changes
                        length={5}
                      />
                  </div>
                  {!otpVerified ? (
                    <button className="otp-button" onClick={handleVerifyOtp}>Verify OTP</button>
                  ) : (
                    <>
                      <div className="login-input">
                        <label htmlFor="new-password">New Password*</label>
                        <input
                          type="password"
                          id="new-password"
                          placeholder="Enter New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="login-input">
                        <label htmlFor="confirm-password">Confirm New Password*</label>
                        <input
                          type="password"
                          id="confirm-password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button className="otp-button" onClick={handleResetPassword}>Reset Password</button>
                    </>
                  )}
                </>
              )}
              <button className="back-to-login" onClick={() => setForgotPassword(false)}>Back to Login</button>
            </div>
          )}
        </div>

        <div className="login-image-container">
          <img src={loginimage} alt="Illustration" className="login-image" />
        </div>
      </div>
    </div>
  );
}

export default Login;
