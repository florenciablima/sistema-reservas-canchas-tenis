import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert
} from "@mui/material";
import client from "../api/client";
import { AuthContext } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ canchas: 0, reservas: 0 });
  const [canchas, setCanchas] = useState([]);
  const [form, setForm] = useState({ nombre: "", tipo: "polvo", precio_por_hora: "" });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const resCanchas = await client.get("/canchas");
        setCanchas(resCanchas.data);
        const resReservas = await client.get("/reservas"); // requiere token (admin)
        setStats({ canchas: resCanchas.data.length, reservas: resReservas.data.length });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  async function handleCreateCancha(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = {
        nombre: form.nombre,
        tipo: form.tipo,
        precio_por_hora: form.precio_por_hora ? Number(form.precio_por_hora) : 0,
        disponible: true
      };
      const res = await client.post("/canchas", payload);
      // actualizar lista local y stats
      setCanchas(prev => [...prev, { id: res.data.id, ...payload }]);
      setStats(prev => ({ ...prev, canchas: prev.canchas + 1 }));
      setForm({ nombre: "", tipo: "polvo", precio_por_hora: "" });
      setMsg({ type: "success", text: "Cancha creada correctamente." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Error creando cancha" });
    }
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Panel de Administración</Typography>
      <Typography variant="subtitle1" gutterBottom>Usuario: {user?.nombre} ({user?.rol})</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Canchas</Typography>
              <Typography variant="h3">{stats.canchas}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{canchas.length} registradas</Typography>
              <Box sx={{ mt: 2 }}>
                <Button href="#crear" variant="contained">Crear Cancha</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Reservas</Typography>
              <Typography variant="h3">{stats.reservas}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Reservas totales</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={async ()=> {
                  try {
                    const res = await client.get("/reservas");
                    setStats(s => ({ ...s, reservas: res.data.length }));
                  } catch (e) { console.error(e); }
                }}>Refrescar</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box id="lista" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Listado de canchas</Typography>
        <Grid container spacing={2}>
          {canchas.map(c => (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{c.nombre}</Typography>
                  <Typography variant="body2">Tipo: {c.tipo}</Typography>
                  <Typography variant="body2">Precio/h: ${c.precio_por_hora}</Typography>
                  <Typography variant="body2">Disponible: {c.disponible ? "Sí" : "No"}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box id="crear">
        <Typography variant="h6" gutterBottom>Crear nueva cancha</Typography>
        {msg && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}
        <Box component="form" onSubmit={handleCreateCancha} sx={{ display: "grid", gap: 2, maxWidth: 480 }}>
          <TextField
            label="Nombre"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            required
          />
          <TextField
            select
            label="Tipo"
            value={form.tipo}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
          >
            <MenuItem value="polvo">Polvo de ladrillo</MenuItem>
            <MenuItem value="cemento">Cemento</MenuItem>
            <MenuItem value="sintetico">Sintético</MenuItem>
          </TextField>
          <TextField
            label="Precio por hora"
            value={form.precio_por_hora}
            onChange={e => setForm(f => ({ ...f, precio_por_hora: e.target.value }))}
            type="number"
            inputProps={{ step: "0.01" }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained">Crear</Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}