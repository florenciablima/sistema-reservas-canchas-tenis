import React from "react";
import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Canchas from "./pages/Canchas";
import ReservaForm from "./pages/ReservaForm";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Home />} />
      <Route path="/canchas" element={<Canchas />} />
      <Route path="/reservar" element={
        <ProtectedRoute>
          <ReservaForm />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* 404 fallback */}
      <Route path="*" element={<div style={{padding:20}}>Página no encontrada</div>} />
    </Routes>
  );
}

