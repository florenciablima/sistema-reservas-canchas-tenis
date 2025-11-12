// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  // Si todavía estamos comprobando la sesión, mostramos loading
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "40px" }}>Cargando sesión...</div>;
  }

  // Si no hay usuario, redirigimos al login
  if (!user) return <Navigate to="/login" replace />;

  // Si necesita admin y no lo es, redirigimos al home
  if (adminOnly && user.rol !== "admin") return <Navigate to="/" replace />;

  return children;
}



