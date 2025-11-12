// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import fondoTenis from "../assets/fondo-tenis.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      // <-- Usamos la función login del contexto CORRECTAMENTE
      await login(email, password);
      // login() ya se encarga de redirigir según rol
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error en login";
      setError(msg);
    }
  }

  return (
    <Box
      sx={{
        backgroundImage: `url(${fondoTenis})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 4,
          padding: 4,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField fullWidth label="Contraseña" type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Button variant="contained" sx={{ mt: 2 }} type="submit">Ingresar</Button>
        </form>
        <Typography sx={{ mt: 2 }}>¿No tenés cuenta? <Link to="/register">Registrate</Link></Typography>
      </Container>
    </Box>
  );
}



