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

  // 🔹 Cargar canchas
  useEffect(() => {
    async function cargarCanchas() {
      try {
        const res = await client.get("/canchas");
        setCanchas(res.data);
      } catch {
        Swal.fire("Error", "No se pudieron cargar las canchas.", "error");
      }
    }
    cargarCanchas();
  }, []);

  // 🔹 Cargar disponibilidad
  useEffect(() => {
    if (!canchaSeleccionada) return;

    async function cargarDisponibilidad() {
      try {
        const res = await client.get(
          `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&fecha=${fechaSeleccionada}&_=${Date.now()}`
        );
        setDisponibilidad(res.data);

        const cancha = canchas.find(
          (c) => String(c.id) === String(canchaSeleccionada)
        );

        setPrecioHora(cancha ? Number(cancha.precio_hora) : 0);
      } catch {
        Swal.fire("Error", "No se pudo cargar la disponibilidad.", "error");
      }
    }

    cargarDisponibilidad();
  }, [canchaSeleccionada, fechaSeleccionada, canchas]);

  // 🔹 Crear reserva
  async function crearReserva(hora_inicio, hora_fin) {
    const token = localStorage.getItem("token");

    await client.post(
      "/reservas",
      {
        cancha_id: canchaSeleccionada,
        fecha: fechaSeleccionada,
        hora_inicio,
        hora_fin,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // 🔹 Acción principal
  async function manejarReserva(bloque) {
    if (bloque.estado !== "disponible") return;

    const confirmar = await Swal.fire({
      title: "¿Confirmar reserva?",
      text: `${new Date(bloque.inicio).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Continuar",
    });

    if (!confirmar.isConfirmed) return;

    const pago = await Swal.fire({
      title: "Elegir método de pago",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Mercado Pago",
      denyButtonText: "Pagar en el club",
      cancelButtonText: "Cancelar",
    });

    if (pago.isDismissed) return;

    try {
      const hora_inicio = bloque.inicio.split("T")[1].slice(0, 5);
      const hora_fin = bloque.fin.split("T")[1].slice(0, 5);

      // 💵 EFECTIVO
      if (pago.isDenied) {
        await crearReserva(hora_inicio, hora_fin);
        Swal.fire("Reserva confirmada", "Pagás en el club", "success");
      }

      // 💳 MERCADO PAGO
      if (pago.isConfirmed) {
        await crearReserva(hora_inicio, hora_fin);

        const res = await client.post("/pagos/mercadopago", {
          cancha_id: canchaSeleccionada,
          fecha: fechaSeleccionada,
          hora_inicio,
          hora_fin,
          precio: Number(precioHora),
        });

        window.location.href = res.data.init_point;
        return;
      }

      // 🔄 refrescar disponibilidad
      const nueva = await client.get(
        `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&fecha=${fechaSeleccionada}&_=${Date.now()}`
      );
      setDisponibilidad(nueva.data);

    } catch (error) {
      console.error("ERROR COMPLETO:", error);
      Swal.fire("Error", "No se pudo completar la operación.", "error");
    }
  }

  const hoy = new Date().toISOString().split("T")[0];
  const maxFecha = new Date();
  maxFecha.setDate(maxFecha.getDate() + 14);
  const max = maxFecha.toISOString().split("T")[0];

  return (
    <Box
      sx={{
        backgroundImage: `url(${fondoTenis})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          bgcolor: "rgba(255,255,255,0.95)",
          p: 4,
          borderRadius: 4,
          boxShadow: 4,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Reservar cancha
        </Typography>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Seleccionar cancha</InputLabel>
          <Select
            value={canchaSeleccionada}
            label="Seleccionar cancha"
            onChange={(e) => setCanchaSeleccionada(e.target.value)}
          >
            {canchas.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {`${c.nombre} — ${c.tipo} — 💰 $${c.precio_hora}/h`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Seleccionar fecha"
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: hoy, max }}
          sx={{ mb: 4 }}
        />

        <Grid container spacing={2}>
          {disponibilidad.map((b, i) => {
            const ahora = new Date();
            const inicio = new Date(b.inicio);

            const ocupada = b.estado !== "disponible";

            const esHoy =
              inicio.toDateString() === ahora.toDateString();

            const pasada = esHoy && inicio < ahora;

            return (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  sx={{
                    backgroundColor: ocupada
                      ? "#f8d7da"
                      : pasada
                      ? "#e0e0e0"
                      : "#e8f5e9",
                    border: ocupada
                      ? "1px solid #dc3545"
                      : pasada
                      ? "1px solid #9e9e9e"
                      : "1px solid #4caf50",
                    borderRadius: 2,
                    opacity: pasada ? 0.7 : 1,
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle1">
                      {inicio.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>

                    <Button
                      variant="contained"
                      color={
                        ocupada ? "error" : pasada ? "inherit" : "success"
                      }
                      disabled={ocupada || pasada}
                      onClick={() => manejarReserva(b)}
                      sx={{ mt: 2 }}
                    >
                      {ocupada
                        ? "Ocupada"
                        : pasada
                        ? "Pasada"
                        : "Reservar"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box textAlign="center" mt={4}>
          <Button variant="outlined" href="/" color="primary">
            Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}