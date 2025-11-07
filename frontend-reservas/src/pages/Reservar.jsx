import React, { useEffect, useState } from "react";
import client from "../api/client";
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

  // Cargar todas las canchas disponibles al inicio
  useEffect(() => {
    async function cargarCanchas() {
      try {
        const res = await client.get("/canchas");
        console.log("Canchas disponibles:", res.data);
        setCanchas(res.data);
      } catch (error) {
        console.error("Error al cargar canchas:", error);
      }
    }
    cargarCanchas();
  }, []);

  // Cargar disponibilidad de la cancha seleccionada
  useEffect(() => {
    if (!canchaSeleccionada) return;

    async function cargarDisponibilidad() {
      try {
        const res = await client.get(
          `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}`
        );
        console.log("Disponibilidad recibida:", res.data);
        setDisponibilidad(res.data);
      } catch (error) {
        console.error("Error al cargar disponibilidad:", error);
      }
    }

    cargarDisponibilidad();
  }, [canchaSeleccionada]);

  // Función para reservar un horario

  async function manejarReserva(horario) {
  if (horario.estado !== "disponible") {
    alert("Este horario ya está ocupado.");
    return;
  }

  const confirmar = window.confirm(
    `¿Confirmar reserva de ${new Date(horario.inicio).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} a ${new Date(horario.fin).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}?`
  );

  if (!confirmar) return;

  try {
    const fecha = horario.inicio.split("T")[0];
    const hora_inicio = horario.inicio.split("T")[1].slice(0, 5);
    const hora_fin = horario.fin.split("T")[1].slice(0, 5);

    const res = await client.post("/reservas", {
      cancha_id: canchaSeleccionada,
      fecha,
      hora_inicio,
      hora_fin,
    });

    alert("✅ Reserva confirmada correctamente");
    console.log("Reserva creada:", res.data);

    // 🔁 Recargar disponibilidad automáticamente
    const nueva = await client.get(
      `/canchas/disponibilidad?cancha_id=${canchaSeleccionada}`
    );
    setDisponibilidad(nueva.data);
  } catch (error) {
    console.error("Error al crear reserva:", error);
    alert("❌ No se pudo crear la reserva.");
  }
}


  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Reservar cancha
      </Typography>

      {/* Selector de cancha */}
      <FormControl fullWidth sx={{ mb: 4, zIndex:9999 }}>
        <InputLabel id="cancha-label">Seleccionar cancha</InputLabel>
        <Select
          id="cancha-select"
          labelId="cancha-label"
          value={canchaSeleccionada || ""}
          label="Seleccionar cancha"
          onChange={(e) => setCanchaSeleccionada(e.target.value)}
          MenuProps={{
            disablePortal:false,
            PaperProps: {
              style: {
                maxHeight: 250,
                zIndex: 2000,
              },
            },
          }}  
        >
          {canchas.map((cancha) => (
            <MenuItem key={cancha.id} value={String(cancha.id)}>
              {cancha.nombre} — {cancha.tipo}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Lista de horarios disponibles */}
      {canchaSeleccionada && (
        <>
          <Typography variant="h6" gutterBottom>
            Horarios disponibles para hoy
          </Typography>

          {disponibilidad.length === 0 ? (
            <Typography color="text.secondary">
              No hay horarios disponibles.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {disponibilidad.map((bloque, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      backgroundColor:
                        bloque.estado === "disponible" ? "#e8f5e9" : "#ffebee",
                      border:
                        bloque.estado === "disponible"
                          ? "1px solid #4caf50"
                          : "1px solid #f44336",
                      borderRadius: 2,
                      boxShadow: 2,
                    }}
                  >
                    <CardContent>
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

                      <Box sx={{ mt: 2, textAlign: "right" }}>
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
                          Reservar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}


