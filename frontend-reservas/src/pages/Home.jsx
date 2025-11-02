import React, { useContext } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import fondoTenis from "../assets/fondo-tenis.jpg";

export default function Home() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isAdminOnHome = user?.rol === "admin" && location.pathname === "/";

  return (
    <Box
      sx={{
        backgroundImage: `url(${fondoTenis})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 4,
          padding: 4,
          textAlign: "center",
          boxShadow: 3,
        }}
      >
        <Typography variant="h3" gutterBottom>
          Bienvenid{user ? (user.nombre?.endsWith("a") ? "a" : "o") : ""} al sistema de reservas
        </Typography>

        {user ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Hola, {user.nombre} ({user.rol})</Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">
              Iniciá sesión o registrate para reservar una cancha.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", mt: 2 }}>
          {user ? (
            <>
              <Button component={Link} to="/canchas" variant="contained">Ver canchas</Button>
              <Button component={Link} to="/reservar" variant="outlined">Reservar</Button>
              {isAdminOnHome && (
                <Button component={Link} to="/admin" variant="contained" color="secondary">
                  Panel Admin
                </Button>
              )}
            </>
          ) : (
            <>
              <Button component={Link} to="/login" variant="contained">Iniciar sesión</Button>
              <Button component={Link} to="/register" variant="outlined">Registrarse</Button>
            </>
          )}
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>Cómo funciona (rápido)</Typography>
          <Typography variant="body2" paragraph>
            - Consultá la lista de canchas y sus precios.<br />
            - Reservá indicando fecha y horario.<br />
            - Los administradores pueden gestionar canchas y ver las reservas.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

