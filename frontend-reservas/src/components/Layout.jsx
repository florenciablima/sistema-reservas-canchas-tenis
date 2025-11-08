import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Layout.css";

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Ocultar el navbar en páginas específicas
  const ocultarNavbar =
    location.pathname.includes("/reservas") ||
    location.pathname.includes("/reservar") ||
    location.pathname.includes("/admin");

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="layout-container">
      {/* Mostrar el header solo si no está en las páginas ocultas */}
      {!ocultarNavbar && (
        <header className="header">
          <h2 className="logo">Club de Tenis</h2>
          <div className="nav-links">
            {user && (
              <>
                {/* Mostrar "Canchas" solo si NO es admin */}
                {user.rol !== "admin" && (
                  <Link to="/canchas">Canchas</Link>
                )}

                <button onClick={handleLogout} className="logout-button">
                  Salir
                </button>
              </>
            )}
          </div>
        </header>
      )}

      <main className="page-container">{children}</main>
    </div>
  );
}



