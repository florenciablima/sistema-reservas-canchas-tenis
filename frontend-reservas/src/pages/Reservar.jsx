import React, { useEffect, useState } from "react";
import client from "../api/client";
import Swal from "sweetalert2";
import fondoTenis from "../assets/fondo-tenis.jpg"; // ✅ Importa la imagen local
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

export default function Reservar() {
  const [canchas, setCanchas] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]);

  // 🔹 Cargar todas las canchas disponibles
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

  // 🔹 Cargar disponibilidad de la cancha seleccionada
  useEffect(() => {
    if (!canchaSeleccionada) return;

    async function cargarDisponibilidad() {
      try {
        const res = await client.get(
          `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&_=${Date.now()}`
        );
        setDisponibilidad(res.data);
      } catch (error) {
        console.error("Error al cargar disponibilidad:", error);
        Swal.fire("Error", "No se pudo cargar la disponibilidad.", "error");
      }
    }

    cargarDisponibilidad();
  }, [canchaSeleccionada]);

  // 🔹 Manejar reserva con confirmación
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

      const fecha = horario.inicio.split("T")[0];
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

      // 🔁 Actualiza estado visual inmediato
      setDisponibilidad((prev) =>
        prev.map((bloque) =>
          bloque.inicio === horario.inicio
            ? { ...bloque, estado: "ocupada" }
            : bloque
        )
      );

      // 🔄 Refresca desde backend
      const nueva = await client.get(
        `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}&_=${Date.now()}`
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

  return (
    <Box
      sx={{
        backgroundImage: `url(${fondoTenis})`, // ✅ Usa la imagen importada
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 4,
          boxShadow: 6,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1e3a8a" }}
        >
          Reservar cancha
        </Typography>

        {/* Selector de cancha */}
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel id="cancha-label">Seleccionar cancha</InputLabel>
          <Select
            id="cancha-select"
            labelId="cancha-label"
            value={canchaSeleccionada || ""}
            label="Seleccionar cancha"
            onChange={(e) => setCanchaSeleccionada(e.target.value)}
            MenuProps={{
              disablePortal: false,
              PaperProps: { style: { maxHeight: 250, zIndex: 2000 } },
            }}
          >
            {canchas.map((cancha) => (
              <MenuItem key={cancha.id} value={String(cancha.id)}>
                {cancha.nombre} — {cancha.tipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Lista de horarios */}
        {canchaSeleccionada && (
          <>
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              sx={{ color: "#374151" }}
            >
              Horarios disponibles para hoy
            </Typography>

            {disponibilidad.length === 0 ? (
              <Typography align="center" color="text.secondary">
                No hay horarios disponibles.
              </Typography>
            ) : (
              <Grid container spacing={2} justifyContent="center">
                {disponibilidad.map((bloque, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        transition: "all 0.3s",
                        "&:hover": {
                          transform:
                            bloque.estado === "disponible"
                              ? "scale(1.03)"
                              : "none",
                        },
                        backgroundColor:
                          bloque.estado === "disponible"
                            ? "#e6f4ea"
                            : "#fde8e8",
                        border:
                          bloque.estado === "disponible"
                            ? "1px solid #4caf50"
                            : "1px solid #f87171",
                        borderRadius: 3,
                        boxShadow: 3,
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="subtitle1" fontWeight="bold">
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
                          sx={{
                            color:
                              bloque.estado === "disponible"
                                ? "success.main"
                                : "error.main",
                            mb: 1,
                          }}
                        >
                          {bloque.estado === "disponible"
                            ? "Disponible"
                            : "Ocupada"}
                        </Typography>

                        <Button
                          fullWidth
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
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Botón volver */}
        <Box textAlign="center" mt={4}>
          <Button variant="outlined" href="/" color="primary">
            Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}





