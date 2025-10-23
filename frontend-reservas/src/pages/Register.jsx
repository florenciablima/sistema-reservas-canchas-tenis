import React, { useState } from "react";
import client from "../api/client";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography } from "@mui/material";

export default function Register(){
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    try {
      await client.post("/usuarios/register", { nombre, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Error en registro");
    }
  }

  return (
    <Container maxWidth="sm" sx={{mt:6}}>
      <Typography variant="h5">Registro</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Nombre" fullWidth value={nombre} onChange={e=>setNombre(e.target.value)} sx={{mt:2}} />
        <TextField label="Email" fullWidth value={email} onChange={e=>setEmail(e.target.value)} sx={{mt:2}} />
        <TextField label="Contraseña" fullWidth type="password" value={password} onChange={e=>setPassword(e.target.value)} sx={{mt:2}} />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" sx={{mt:2}} type="submit">Crear cuenta</Button>
      </form>
    </Container>
  );
}