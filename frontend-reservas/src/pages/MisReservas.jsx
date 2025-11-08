import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Swal from "sweetalert2";
import fondoTenis from "../assets/fondo-tenis.jpg";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";
import { Cancel, ArrowBack } from "@mui/icons-material";

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  // 🔹 Cargar reservas del usuario logueado
  useEffect(() => {
    async function cargarReservas() {
      setCargando(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Error", "Debe iniciar sesión para ver sus reservas.", "error");
          navigate("/login");
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
  }, [navigate]);

  // 🔹 Cancelar reserva
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
      if (!token) {
        Swal.fire("Error", "Debe iniciar sesión para cancelar.", "error");
        return;
      }

      await client.put(
        `/reservas/${id}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Cancelada", "La reserva fue cancelada correctamente.", "success");

      // 🔁 Actualizar estado local
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "cancelada" } : r))
      );
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      Swal.fire("Error", "No se pudo cancelar la reserva.", "error");
    }
  }

  // 🔹 Paginación
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${fondoTenis})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          backgroundColor: "rgba(255,255,255,0.92)",
          borderRadius: 4,
          boxShadow: 5,
          p: 4,
          position: "relative",
        }}
      >
        {/* Botón volver arriba derecha */}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          sx={{ position: "absolute", top: 16, right: 16 }}
        >
          Volver al inicio
        </Button>

        {/* Título */}
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#1e3a8a", mb: 4 }}
        >
          Mis Reservas
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
            <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><strong>Cancha</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Hora Inicio</strong></TableCell>
                    <TableCell><strong>Hora Fin</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.cancha_nombre}</TableCell>
                        <TableCell>{r.fecha}</TableCell>
                        <TableCell>{r.hora_inicio}</TableCell>
                        <TableCell>{r.hora_fin}</TableCell>
                        <TableCell
                          sx={{
                            color:
                              r.estado === "cancelada"
                                ? "error.main"
                                : "success.main",
                            fontWeight: 600,
                          }}
                        >
                          {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<Cancel />}
                            disabled={r.estado === "cancelada"}
                            onClick={() => cancelarReserva(r.id)}
                          >
                            {r.estado === "cancelada"
                              ? "Cancelada"
                              : "Cancelar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
              component="div"
              count={reservas.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Reservas por página:"
            />
          </>
        )}
      </Container>
    </Box>
  );
}



