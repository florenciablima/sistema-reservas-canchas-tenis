import React, { useContext } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h3" gutterBottom>Bienvenid{user ? (user.nombre ? (user.nombre.endsWith("a") ? "a" : "o") : "") : ""} al sistema de reservas</Typography>

      {user ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Hola, {user.nombre} ({user.rol})</Typography>
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">Iniciá sesión o registrate para reservar una cancha.</Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
        <Button component={Link} to="/canchas" variant="contained">Ver canchas</Button>
        <Button component={Link} to="/reservar" variant="outlined">Reservar</Button>
        {!user && <Button component={Link} to="/login" variant="text">Iniciar sesión</Button>}
        {!user && <Button component={Link} to="/register" variant="text">Registrarse</Button>}
        {user && user.rol === "admin" && (
          <Button component={Link} to="/admin" variant="contained" color="secondary">Panel Admin</Button>
        )}
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>Cómo funciona (rápido)</Typography>
        <Typography variant="body2" paragraph>
          - Consultá la lista de canchas y sus precios.  
          - Reservá indicando fecha y horario.  
          - Los administradores pueden gestionar canchas y ver las reservas.
        </Typography>
      </Box>
    </Container>
  );
}
