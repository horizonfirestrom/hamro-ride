import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import LoginPage from "./pages/LoginPage";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/passenger"
            element={
              <ProtectedRoute allow={["PASSENGER"]}>
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute allow={["DRIVER"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
