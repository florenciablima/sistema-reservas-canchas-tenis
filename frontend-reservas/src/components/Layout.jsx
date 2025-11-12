import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Layout.css";
import logoTenis from "../assets/logo-club-tenis.avif";

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Ocultar el navbar en ciertas páginas
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
      {!ocultarNavbar && (
        <header className="header">
          <div className="logo-container">
            <img src={logoTenis} alt="Club de Tenis" className="logo-img" />
          </div>

          <div className="nav-links">
            {user && (
              <>
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






