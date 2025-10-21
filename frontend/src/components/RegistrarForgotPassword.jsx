import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Snackbar,
  Alert,
  Box,
  Container,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import "../styles/Container.css";
import Logo from "../assets/Logo.png";
import SchoolImage from "../assets/image.png";
import { Email } from "@mui/icons-material";
import ReCAPTCHA from "react-google-recaptcha";

const RegistrarForgotPassword = () => {
  const [capVal, setCapVal] = useState(null);
  const [email, setEmail] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [loading, setLoading] = useState(false); // 🔹 NEW state

  // 🔹 Handle Reset Password
  const handleReset = async () => {
    if (!email) {
      setSnack({
        open: true,
        message: "Please enter your email.",
        severity: "warning",
      });
      return;
    }

    if (!capVal) {
      setSnack({
        open: true,
        message: "Please verify you're not a robot.",
        severity: "warning",
      });
      return;
    }

    if (loading) return; // ⛔ Prevent double click
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/forgot-password", {
        email,
      });
      setSnack({
        open: true,
        message: res.data.message,
        severity: "success",
      });
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || "Something went wrong.",
        severity: "error",
      });
    } finally {
      setLoading(false); // ✅ Re-enable after request finishes
    }
  };

  // 🔒 Disable right-click & devtools keys
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      const blocked =
        e.key === "F12" ||
        e.key === "F11" ||
        (e.ctrlKey && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && ["u", "p"].includes(e.key.toLowerCase()));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 🔹 Close Snackbar
  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
  };

  const isButtonDisabled = !email || !capVal || loading;

  return (
    <Box
      sx={{
        backgroundImage: `url(${SchoolImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        maxWidth={false}
      >
        <div style={{ border: "5px solid white" }} className="Container">
          {/* Header */}
          <div className="Header">
            <div className="HeaderTitle">
              <div className="CircleCon">
                <img src={Logo} alt="EARIST Logo" />
              </div>
            </div>
            <div className="HeaderBody">
              <strong>EARIST</strong>
              <p>Student Information System</p>
            </div>
          </div>

          {/* Body */}
          <div className="Body">
            <label htmlFor="email">Email Address:</label>
            <TextField
              fullWidth
              type="email"
              placeholder="Enter your Email Address (e.g., username@gmail.com)"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
                sx: {
                  height: "50px",
                  "& input": {
                    height: "50px",
                    padding: "0 10px",
                    boxSizing: "border-box",
                  },
                },
              }}
            />

            {/* CAPTCHA */}
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ReCAPTCHA
                sitekey="6Lfem44rAAAAAEeAexdQxvN0Lpm1V4KPu1bBxaGy"
                onChange={(val) => setCapVal(val)}
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleReset}
                variant="contained"
                disabled={isButtonDisabled}
                sx={{
                  width: "100%",
                  py: 1.5,
                  backgroundColor: "#6D2323",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#6D2323",
                  },
                }}
              >
                {loading ? "Sending..." : "Reset Password"}
              </Button>
            </Box>

            {/* Back to login */}
            <div className="LinkContainer" style={{ marginTop: "1rem" }}>
              <p>To go to login page,</p>
              <span>
                <Link to="/" style={{ textDecoration: "underline" }}>
                  Click here
                </Link>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="Footer">
            <div className="FooterText">
              &copy; 2025 Student EARIST Information System. All rights reserved.
            </div>
          </div>
        </div>
      </Container>

      {/* Snackbar Notification */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={handleClose} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrarForgotPassword;
