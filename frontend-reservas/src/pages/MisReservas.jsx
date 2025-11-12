import React, { useEffect, useState } from "react";
import client from "../api/client";
import Swal from "sweetalert2";
import fondoTenis from "../assets/fondo-tenis.jpg";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  CircularProgress,
  Pagination,
} from "@mui/material";

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const porPagina = 6; // 🔹 cantidad de reservas visibles por página

  // 🔹 Cargar reservas del usuario
  useEffect(() => {
    async function cargarReservas() {
      setCargando(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Error", "Debe iniciar sesión para ver sus reservas.", "error");
          setCargando(false);
          return;
        }

        const res = await client.get("/reservas/mias", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReservas(res.data);
      } catch (error) {
        console.error("Error al cargar reservas:", error);
        Swal.fire("Error", "No se pudieron cargar las reservas.", "error");
      } finally {
        setCargando(false);
      }
    }

    cargarReservas();
  }, []);

  // 🔹 Cancelar una reserva
  async function cancelarReserva(id) {
    const confirmar = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: "Esta acción liberará el horario para otros usuarios.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await client.put(
        `/reservas/${id}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Reserva cancelada", "El turno fue liberado correctamente.", "success");

      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "cancelada" } : r))
      );
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      const msg = error.response?.data?.error || "No se pudo cancelar la reserva.";
      Swal.fire("Error", msg, "error");
    }
  }

  // 🔹 Calcular reservas visibles por página
  const totalPaginas = Math.ceil(reservas.length / porPagina);
  const reservasVisibles = reservas.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

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
          Mis reservas
        </Typography>

        {cargando ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : reservas.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No tenés reservas activas.
          </Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {reservasVisibles.map((r) => (
                <Grid item xs={12} sm={6} md={4} key={r.id}>
                  <Card
                    sx={{
                      backgroundColor:
                        r.estado === "cancelada" ? "#fff5f5" : "#f0fff4",
                      border:
                        r.estado === "cancelada"
                          ? "1px solid #f87171"
                          : "1px solid #4caf50",
                      borderRadius: 3,
                      boxShadow: 3,
                      p: 1,
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {r.cancha_nombre}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {r.fecha} — {r.hora_inicio} a {r.hora_fin}
                      </Typography>

                      {/* 💰 Mostrar precio (toma ambas variantes por seguridad) */}
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        💰 Precio: ${r.precio_hora ?? r.precio_por_hora ?? "—"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            r.estado === "cancelada" ? "error.main" : "success.main",
                          mb: 2,
                          fontWeight: 600,
                        }}
                      >
                        {r.estado === "cancelada" ? "Cancelada" : "Confirmada"}
                      </Typography>

                      <Button
                        variant="contained"
                        color={r.estado === "cancelada" ? "error" : "warning"}
                        fullWidth
                        disabled={r.estado === "cancelada"}
                        onClick={() => cancelarReserva(r.id)}
                      >
                        {r.estado === "cancelada" ? "Cancelada" : "Cancelar"}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* 🔹 Paginación */}
            {totalPaginas > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPaginas}
                  page={pagina}
                  onChange={(e, val) => setPagina(val)}
                  color="primary"
                />
              </Box>
            )}
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





