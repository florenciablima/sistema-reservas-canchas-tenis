import React, { useEffect, useState } from "react";
import client from "../api/client";
import Swal from "sweetalert2";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
} from "@mui/material";
import fondoTenis from "../assets/fondo-tenis.jpg";

export default function Reservar() {
  const [canchas, setCanchas] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [precioHora, setPrecioHora] = useState(0);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    async function cargarCanchas() {
      const res = await client.get("/canchas");
      setCanchas(res.data || []);
    }
    cargarCanchas();
  }, []);

  useEffect(() => {
    if (!canchaSeleccionada) return;

    async function cargarDisponibilidad() {
      const res = await client.get(
        `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&fecha=${fechaSeleccionada}&_=${Date.now()}`
      );

      setDisponibilidad(res.data || []);

      const cancha = canchas.find(
        (c) => String(c.id) === String(canchaSeleccionada)
      );

      setPrecioHora(cancha ? Number(cancha.precio_hora) : 0);
    }

    cargarDisponibilidad();
  }, [canchaSeleccionada, fechaSeleccionada, canchas]);

  async function crearReserva(hora_inicio, hora_fin) {
    const res = await client.post("/reservas", {
      cancha_id: canchaSeleccionada,
      fecha: fechaSeleccionada,
      hora_inicio,
      hora_fin,
    });

    return res.data;
  }

  async function manejarReserva(bloque) {
    if (bloque.estado !== "disponible") return;

    const pago = await Swal.fire({
      title: "Elegir método de pago",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Mercado Pago",
      denyButtonText: "Pagar en el club",
    });

    if (pago.isDismissed) return;

    const separadorInicio = bloque.inicio.includes("T") ? "T" : " ";
    const separadorFin = bloque.fin.includes("T") ? "T" : " ";
    const hora_inicio = bloque.inicio.split(separadorInicio)[1].slice(0, 5);
    const hora_fin = bloque.fin.split(separadorFin)[1].slice(0, 5);
    console.log("Enviando reserva:", { cancha_id: canchaSeleccionada, fecha: fechaSeleccionada, hora_inicio, hora_fin });

    try {
      // EFECTIVO
      if (pago.isDenied) {
        await crearReserva(hora_inicio, hora_fin);

        Swal.fire("Reserva confirmada", "Pagás en el club", "success");
      }

      // MERCADO PAGO
      if (pago.isConfirmed) {
        const reserva = await crearReserva(hora_inicio, hora_fin);

        const pago_id = reserva.pago_id;

        const res = await client.post("/pagos/mercadopago", {
          pago_id,
        });

        window.location.href = res.data.init_point;
        return;
      }

      const nueva = await client.get(
        `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&fecha=${fechaSeleccionada}&_=${Date.now()}`
      );

      setDisponibilidad(nueva.data);

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo completar la reserva", "error");
    }
  }

  return (
    <Box
      sx={{
        backgroundImage: `url(${fondoTenis})`,
        backgroundSize: "cover",
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Container sx={{ bgcolor: "rgba(255,255,255,0.95)", p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Reservar cancha
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Cancha</InputLabel>
          <Select
            value={canchaSeleccionada}
            onChange={(e) => setCanchaSeleccionada(e.target.value)}
          >
            {canchas.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.nombre} — ${c.precio_hora}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Grid container spacing={2}>
          {disponibilidad.map((b, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography>
                    {new Date(b.inicio).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>

                  <Button
                    disabled={b.estado !== "disponible"}
                    onClick={() => manejarReserva(b)}
                    sx={{ mt: 2 }}
                  >
                    {b.estado}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={4}>
          <Button variant="outlined" href="/">
            Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}