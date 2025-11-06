import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import MisReservas from "./pages/MisReservas";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { AuthContext } from "./contexts/AuthContext";
import Reservar from "./pages/Reservar"; // ✅ este es el componente correcto
import "./App.css";

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home con Layout siempre visible */}
      <Route path="/" element={<Layout><Home /></Layout>} />

      {/* Rutas protegidas con Layout */}
      <Route path="/reservar" element={
        <ProtectedRoute>
          <Layout><Reservar /></Layout> {/* ✅ corregido aquí */}
        </ProtectedRoute>
      } />
      <Route path="/reservas" element={
        <ProtectedRoute>
          <Layout><MisReservas /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* 404 fallback */}
      <Route path="*" element={<div style={{ padding: 20 }}>Página no encontrada</div>} />
    </Routes>
  );
}