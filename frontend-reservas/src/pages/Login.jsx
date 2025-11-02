import React, { useState, useContext } from "react";
import client from "../api/client";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Container, TextField, Button, Typography } from "@mui/material";



export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(e){
    e.preventDefault();
    try {
      const res = await client.post("/usuarios/login", { email, password });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error en login");
    }
  }

  return (
    <Container maxWidth="sm" sx={{mt:6}}>
      <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Email" margin="normal" value={email} onChange={e=>setEmail(e.target.value)} />
        <TextField fullWidth label="Contraseña" type="password" margin="normal" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" sx={{mt:2}} type="submit">Ingresar</Button>
      </form>
      <Typography sx={{mt:2}}>¿No tenés cuenta? <Link to="/register">Registrate</Link></Typography>
    </Container>
  );
}


