// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Restaurar sesión desde localStorage al cargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre");
    const rol = localStorage.getItem("rol");
    const id = localStorage.getItem("id");

    if (token && nombre && rol && id) {
      setUser({ id, nombre, rol });
    }
    setLoading(false);
  }, []);

  // ✅ Iniciar sesión
  async function login(email, password) {
    try {
      const res = await client.post("/usuarios/login", { email, password });
      const { token, id, nombre, rol } = res.data;

      if (!token) throw new Error("No se recibió token del servidor");

      // Guardar sesión en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("nombre", nombre);
      localStorage.setItem("rol", rol);
      localStorage.setItem("id", id);

      // Actualizar contexto
      setUser({ id, nombre, rol });

      // 🔹 Redirigir siempre al Home
      navigate("/");
    } catch (err) {
      console.error("Error en login:", err);
      throw err;
    }
  }

  // ✅ Cerrar sesión
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
    localStorage.removeItem("id");
    setUser(null);
    navigate("/login");
  }

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        Cargando...
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}




