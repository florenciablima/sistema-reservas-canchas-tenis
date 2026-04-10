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
        console.error("Error al cargar canchas:", error);
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
        console.error("Error al cargar disponibilidad:", error);
        Swal.fire("Error", "No se pudo cargar la disponibilidad.", "error");
      }
    }

    cargarDisponibilidad();
  }, [canchaSeleccionada, fechaSeleccionada, canchas]);

  async function manejarReserva(horario) {
    if (horario.estado !== "disponible") {
      Swal.fire("Ocupada", "Este horario ya está reservado.", "warning");
      return;
    }

    const confirmar = await Swal.fire({
      title: "¿Confirmar reserva?",
      text: `De ${new Date(horario.inicio).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} a ${new Date(horario.fin).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, reservar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Error", "Debe iniciar sesión para reservar.", "error");
        return;
      }

      // 🔹 USAR LA FECHA SELECCIONADA
      const fecha = fechaSeleccionada;

      const hora_inicio = horario.inicio.split("T")[1].slice(0, 5);
      const hora_fin = horario.fin.split("T")[1].slice(0, 5);

      await client.post(
        "/reservas",
        { cancha_id: canchaSeleccionada, fecha, hora_inicio, hora_fin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await Swal.fire(
        "✅ Reserva confirmada",
        "Tu turno fue reservado correctamente.",
        "success"
      );

      const nueva = await client.get(
        `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&fecha=${fechaSeleccionada}&_=${Date.now()}`
      );
      setDisponibilidad(nueva.data);

    } catch (error) {
      console.error("Error al crear reserva:", error);
      const mensaje =
        error.response?.data?.error ||
        "No se pudo crear la reserva. Intenta nuevamente.";
      Swal.fire("❌ Error", mensaje, "error");
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
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: 4,
          boxShadow: 4,
          p: 4,
        }}
      >
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Reservar cancha
        </Typography>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel id="cancha-label">Seleccionar cancha</InputLabel>
          <Select
            id="cancha-select"
            labelId="cancha-label"
            value={canchaSeleccionada || ""}
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

        <FormControl fullWidth sx={{ mb: 4 }}>
          <Typography variant="subtitle1">Seleccionar fecha</Typography>
          <input
            type="date"
            value={fechaSeleccionada}
            min={hoy}
            max={max}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </FormControl>

        {canchaSeleccionada && (
          <>
            <Typography variant="h6" gutterBottom align="center">
              Precio por hora: 💰 ${precioHora}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Horarios disponibles para {fechaSeleccionada}:
            </Typography>

            <Grid container spacing={2}>
              {disponibilidad.map((bloque, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      backgroundColor:
                        bloque.estado === "disponible"
                          ? "#e8f5e9"
                          : "#f8d7da",
                      border:
                        bloque.estado === "disponible"
                          ? "1px solid #4caf50"
                          : "1px solid #dc3545",
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

                      <Typography
                        variant="body2"
                        color={
                          bloque.estado === "disponible"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {bloque.estado === "disponible"
                          ? "Disponible"
                          : "Ocupada"}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color={
                            bloque.estado === "disponible"
                              ? "success"
                              : "error"
                          }
                          disabled={bloque.estado !== "disponible"}
                          onClick={() => manejarReserva(bloque)}
                        >
                          {bloque.estado === "disponible"
                            ? "Reservar"
                            : "Ocupada"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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