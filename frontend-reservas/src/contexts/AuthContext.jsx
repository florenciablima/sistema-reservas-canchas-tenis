import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) setUser(JSON.parse(storedUser));
  }, []);

  function login(data) {
    // data: { token, id, nombre, rol }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ id: data.id, nombre: data.nombre, rol: data.rol }));
    setUser({ id: data.id, nombre: data.nombre, rol: data.rol });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}