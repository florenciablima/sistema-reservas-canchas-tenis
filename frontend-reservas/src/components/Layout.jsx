import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Layout.css";

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="layout-container">
      <header className="header">
        <h2 className="logo">Club de Tenis</h2>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/canchas">Canchas</Link>
              <Link to="/reservas">Mis Reservas</Link>
              <button onClick={handleLogout} className="logout-button">Salir</button>
            </>
          ) : (
            <>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/register">Registrarse</Link>
            </>
          )}
        </div>
      </header>

      <main className="page-container">
        {children}
      </main>
    </div>
  );
}

