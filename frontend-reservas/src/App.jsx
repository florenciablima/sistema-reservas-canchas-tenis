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
import Reservar from "./pages/Reservar";
import PagoExitoso from "./pages/PagoExitoso"; // ✅ IMPORTANTE
import "./App.css";

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* 🟢 Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🟢 Home */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      {/* 🟢 Reservar */}
      <Route
        path="/reservar"
        element={
          <ProtectedRoute>
            <Layout>
              <Reservar />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🟢 Mis reservas */}
      <Route
        path="/reservas"
        element={
          <ProtectedRoute>
            <Layout>
              <MisReservas />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🟢 Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🟢 PAGO EXITOSO (CLAVE PARA MERCADO PAGO) */}
      <Route
        path="/pago-exitoso"
        element={
          <Layout>
            <PagoExitoso />
          </Layout>
        }
      />

      {/* 🟢 PAGO ERROR */}
      <Route
        path="/pago-error"
        element={
          <Layout>
            <div style={{ padding: 20 }}>
              ❌ Error en el pago
            </div>
          </Layout>
        }
      />

      {/* 🟢 404 */}
      <Route
        path="*"
        element={
          <div style={{ padding: 20 }}>
            Página no encontrada
          </div>
        }
      />
    </Routes>
  );
}