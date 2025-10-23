import React, { useState } from "react";
import client from "../api/client";
import { Container, TextField, Button, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ReservaForm(){
  const [cancha_id, setCanchaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora_inicio, setHoraInicio] = useState("");
  const [hora_fin, setHoraFin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    try {
      await client.post("/reservas", { cancha_id, fecha, hora_inicio, hora_fin });
      navigate("/"); // o /mis-reservas si lo implementás
    } catch (err) {
      setError(err.response?.data?.error || "Error creando reserva");
    }
  }

  // Para simplificar: pedimos que el usuario ponga el id de cancha (podés mejorar con select)
  return (
    <Container sx={{mt:6}} maxWidth="sm">
      <Typography variant="h5">Reservar cancha</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="ID Cancha" fullWidth value={cancha_id} onChange={e=>setCanchaId(e.target.value)} sx={{mt:2}} />
        <TextField label="Fecha (YYYY-MM-DD)" fullWidth value={fecha} onChange={e=>setFecha(e.target.value)} sx={{mt:2}} />
        <TextField label="Hora inicio (HH:MM:SS)" fullWidth value={hora_inicio} onChange={e=>setHoraInicio(e.target.value)} sx={{mt:2}} />
        <TextField label="Hora fin (HH:MM:SS)" fullWidth value={hora_fin} onChange={e=>setHoraFin(e.target.value)} sx={{mt:2}} />
        {error && <Typography color="error">{error}</Typography>}
        <Button sx={{mt:2}} variant="contained" type="submit">Reservar</Button>
      </form>
    </Container>
  );
}