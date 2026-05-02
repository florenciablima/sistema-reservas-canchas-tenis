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
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function MisReservas() {
  const navigate = useNavigate();

  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [tab, setTab] = useState("futuras");

  const porPagina = 6;

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
    setCargando(true);
    try {
      // ✅ ENDPOINT CORRECTO (NO ADMIN)
      const res = await client.get("/reservas/mias");
      setReservas(res.data);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar tus reservas", "error");
    } finally {
      setCargando(false);
    }
  }

  function formatearFecha(fecha) {
    const [year, month, day] = fecha.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  }

  async function cancelarReserva(id) {
    const confirmar = await Swal.fire({
      title: "¿Cancelar reserva?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirmar.isConfirmed) return;

    try {
      await client.put(`/reservas/${id}/cancelar`);
      cargarReservas();
      Swal.fire("Cancelada", "Reserva cancelada", "success");
    } catch {
      Swal.fire("Error", "No se pudo cancelar", "error");
    }
  }

  const ahora = new Date();

  function obtenerFin(r) {
    return new Date(`${r.fecha.split("T")[0]}T${r.hora_fin}`);
  }

  const futuras = reservas.filter(
    (r) => obtenerFin(r) > ahora && r.estado !== "cancelada"
  );

  const historial = reservas.filter(
    (r) => obtenerFin(r) <= ahora || r.estado === "cancelada"
  );

  const lista = tab === "futuras" ? futuras : historial;

  const totalPaginas = Math.ceil(lista.length / porPagina);
  const visibles = lista.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  return (
    <Box
      sx={{
        backgroundImage: `url(${fondoTenis})`,
        backgroundSize: "cover",
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
        }}
      >
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h4">Mis reservas</Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>
        </Box>

        {/* TABS */}
        <Box display="flex" justifyContent="center" gap={2} mb={3}>
          <Button
            variant={tab === "futuras" ? "contained" : "outlined"}
            onClick={() => {
              setTab("futuras");
              setPagina(1);
            }}
          >
            Próximas
          </Button>

          <Button
            variant={tab === "historial" ? "contained" : "outlined"}
            onClick={() => {
              setTab("historial");
              setPagina(1);
            }}
          >
            Historial
          </Button>
        </Box>

        {cargando ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : visibles.length === 0 ? (
          <Typography align="center">No tenés reservas</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {visibles.map((r) => (
                <Grid item xs={12} sm={6} md={4} key={r.id}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h6">
                        {r.cancha_nombre}
                      </Typography>

                      <Typography>
                        {formatearFecha(r.fecha)}
                      </Typography>

                      <Typography>
                        {r.hora_inicio} - {r.hora_fin}
                      </Typography>

                      <Typography sx={{ mt: 1 }}>
                        {r.pago_estado === "pagado"
                          ? "🟢 Pagado"
                          : "🟡 Pendiente"}
                      </Typography>

                      <Typography>{r.estado}</Typography>

                      {tab === "futuras" && r.estado !== "cancelada" && (
                        <Button
                          color="error"
                          sx={{ mt: 2 }}
                          onClick={() => cancelarReserva(r.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPaginas > 1 && (
              <Box textAlign="center" mt={3}>
                <Pagination
                  count={totalPaginas}
                  page={pagina}
                  onChange={(e, val) => setPagina(val)}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}