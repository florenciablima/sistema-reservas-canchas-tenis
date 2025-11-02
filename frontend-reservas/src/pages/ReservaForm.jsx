import React, { useState, useEffect } from "react";
import client from "../api/client";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ReservaForm() {
  const [cancha_id, setCanchaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora_inicio, setHoraInicio] = useState("");
  const [hora_fin, setHoraFin] = useState("");
  const [error, setError] = useState("");
  const [canchas, setCanchas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCanchas() {
      try {
        const res = await client.get("/canchas");
        setCanchas(res.data);
      } catch (err) {
        console.error("Error cargando canchas", err);
      }
    }
    loadCanchas();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await client.post("/reservas", { cancha_id, fecha, hora_inicio, hora_fin });
      navigate("/reservas"); // redirige a "Mis Reservas"
    } catch (err) {
      setError(err.response?.data?.error || "Error creando reserva");
    }
  }

  return (
    <Container sx={{ mt: 6 }} maxWidth="sm">
      <Typography variant="h5" gutterBottom>Reservar cancha</Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="cancha-label">Seleccioná una cancha</InputLabel>
          <Select
            labelId="cancha-label"
            value={cancha_id}
            label="Seleccioná una cancha"
            onChange={e => setCanchaId(e.target.value)}
            required
          >
            {canchas.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre} — {c.tipo} (${c.precio_por_hora}/h)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Fecha (YYYY-MM-DD)"
          fullWidth
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          sx={{ mt: 2 }}
          required
        />
        <TextField
          label="Hora inicio (HH:MM:SS)"
          fullWidth
          value={hora_inicio}
          onChange={e => setHoraInicio(e.target.value)}
          sx={{ mt: 2 }}
          required
        />
        <TextField
          label="Hora fin (HH:MM:SS)"
          fullWidth
          value={hora_fin}
          onChange={e => setHoraFin(e.target.value)}
          sx={{ mt: 2 }}
          required
        />
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        <Button sx={{ mt: 3 }} variant="contained" type="submit">Reservar</Button>
      </form>
    </Container>
  );
}
