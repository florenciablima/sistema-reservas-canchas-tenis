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
      try {
        const res = await client.get("/canchas");
        setCanchas(res.data);
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar las canchas.", "error");
      }
    }
    cargarCanchas();
  }, []);

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
        setPrecioHora(cancha ? cancha.precio_hora : 0);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar la disponibilidad.", "error");
      }
    }

    cargarDisponibilidad();
  }, [canchaSeleccionada, fechaSeleccionada, canchas]);

  const enMantenimiento =
    disponibilidad.length > 0 &&
    disponibilidad.every((b) => b.estado === "mantenimiento");

  async function manejarReserva(bloque) {
    if (bloque.estado !== "disponible") return;

    const confirmar = await Swal.fire({
      title: "¿Confirmar reserva?",
      text: `${new Date(bloque.inicio).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(bloque.fin).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reservar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const hora_inicio = bloque.inicio.split("T")[1].slice(0, 5);
      const hora_fin = bloque.fin.split("T")[1].slice(0, 5);

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

      Swal.fire("Reserva confirmada", "", "success");

      const nueva = await client.get(
        `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&fecha=${fechaSeleccionada}&_=${Date.now()}`
      );
      setDisponibilidad(nueva.data);
    } catch (error) {
      Swal.fire("Error", "No se pudo crear la reserva.", "error");
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
          backgroundColor: "rgba(255,255,255,0.94)",
          borderRadius: 4,
          boxShadow: 6,
          p: 4,
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
            {canchas.map((cancha) => (
              <MenuItem key={cancha.id} value={String(cancha.id)}>
                {`${cancha.nombre} — ${cancha.tipo} — 💰 $${cancha.precio_hora}/h`}
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
          disabled={enMantenimiento}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: hoy,
            max: max,
          }}
          sx={{ mb: 4 }}
        />

        {canchaSeleccionada && enMantenimiento && (
          <Box
            sx={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ff9800",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" color="warning.main">
              ⚠️ Esta cancha se encuentra en mantenimiento
            </Typography>
            <Typography variant="body2">
              Por favor seleccione otra cancha o intente nuevamente más tarde.
            </Typography>
          </Box>
        )}

        {canchaSeleccionada && !enMantenimiento && (
          <>
            <Typography variant="h6" align="center" sx={{ mb: 3 }}>
              Precio por hora: 💰 ${precioHora}
            </Typography>

            <Grid container spacing={2}>
              {disponibilidad.map((bloque, index) => {
                const ocupada = bloque.estado === "ocupada";

                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      sx={{
                        backgroundColor: ocupada ? "#f8d7da" : "#e8f5e9",
                        border: ocupada
                          ? "1px solid #dc3545"
                          : "1px solid #4caf50",
                        borderRadius: 2,
                        boxShadow: 2,
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="subtitle1">
                          {new Date(bloque.inicio).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(bloque.fin).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            color={ocupada ? "error" : "success"}
                            disabled={ocupada}
                            onClick={() => manejarReserva(bloque)}
                          >
                            {ocupada ? "Ocupada" : "Reservar"}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

        <Box textAlign="center" mt={4}>
          <Button variant="outlined" href="/" color="primary">
            Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}