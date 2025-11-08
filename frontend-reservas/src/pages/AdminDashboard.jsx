import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
} from "@mui/material";
import { Edit, Delete, BuildCircle, ArrowBack } from "@mui/icons-material";
import Swal from "sweetalert2";
import client from "../api/client";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({ canchas: 0, reservas: 0 });
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [msg, setMsg] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    tipo: "polvo",
    precio_hora: "",
    disponible: true,
  });

  // 🔹 PAGINACIÓN Canchas
  const [pageC, setPageC] = useState(0);
  const [rowsPerPageC, setRowsPerPageC] = useState(5);
  const handleChangePageC = (event, newPage) => setPageC(newPage);
  const handleChangeRowsPerPageC = (event) => {
    setRowsPerPageC(parseInt(event.target.value, 10));
    setPageC(0);
  };

  // 🔹 PAGINACIÓN Reservas
  const [pageR, setPageR] = useState(0);
  const [rowsPerPageR, setRowsPerPageR] = useState(5);
  const handleChangePageR = (event, newPage) => setPageR(newPage);
  const handleChangeRowsPerPageR = (event) => {
    setRowsPerPageR(parseInt(event.target.value, 10));
    setPageR(0);
  };

  // 🟢 Cargar datos iniciales
  useEffect(() => {
    async function load() {
      try {
        const resCanchas = await client.get("/canchas");
        const resReservas = await client.get("/reservas");
        setCanchas(resCanchas.data);
        setReservas(resReservas.data);
        setStats({
          canchas: resCanchas.data.length,
          reservas: resReservas.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  // 🟢 Crear o actualizar cancha
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      if (form.id) {
        await client.put(`/canchas/${form.id}`, form);
        setMsg({ type: "success", text: "Cancha actualizada correctamente." });
      } else {
        const res = await client.post("/canchas", form);
        setCanchas((prev) => [...prev, { id: res.data.id, ...form }]);
        setMsg({ type: "success", text: "Cancha creada correctamente." });
      }
      setOpenDialog(false);
      const resCanchas = await client.get("/canchas");
      setCanchas(resCanchas.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.error || "Error al guardar la cancha.",
      });
    }
  }

  // 🟢 Eliminar cancha
  async function handleDelete(id) {
    const confirmar = await Swal.fire({
      title: "¿Eliminar cancha?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmar.isConfirmed) return;

    try {
      await client.delete(`/canchas/${id}`);
      setCanchas((prev) => prev.filter((c) => c.id !== id));
      Swal.fire("Eliminada", "La cancha fue eliminada correctamente.", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar la cancha.", "error");
    }
  }

  // 🟢 Cambiar estado de mantenimiento
  async function toggleMantenimiento(c) {
    try {
      await client.put(`/canchas/${c.id}`, { ...c, disponible: !c.disponible });
      const resCanchas = await client.get("/canchas");
      setCanchas(resCanchas.data);
      Swal.fire(
        "Actualizado",
        `La cancha ahora está ${!c.disponible ? "disponible" : "en mantenimiento"}.`,
        "success"
      );
    } catch (err) {
      Swal.fire("Error", "No se pudo cambiar el estado.", "error");
    }
  }

  // 🟢 Cancelar reserva
  async function cancelarReserva(id) {
    const confirmar = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: "Esta acción liberará el turno.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });
    if (!confirmar.isConfirmed) return;

    try {
      await client.put(`/reservas/${id}/cancelar`);
      const res = await client.get("/reservas");
      setReservas(res.data);
      Swal.fire("Cancelada", "La reserva fue cancelada exitosamente.", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo cancelar la reserva.", "error");
    }
  }

  // 🟢 Filtro reservas
  const [filtroCancha, setFiltroCancha] = useState("");
  const reservasFiltradas = reservas.filter((r) =>
    filtroCancha ? r.cancha_nombre === filtroCancha : true
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/src/assets/fondo-tenis.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: 5,
      }}
    >
      <Container sx={{ bgcolor: "rgba(255,255,255,0.9)", p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" gutterBottom color="primary">
            Panel de Administración
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Usuario: {user?.nombre} ({user?.rol})
        </Typography>

        <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 3 }}>
          <Tab label="Canchas" />
          <Tab label="Reservas" />
        </Tabs>

        {/* 🟢 TAB CANCHAS */}
        {tab === 0 && (
          <>
            <Box sx={{ mb: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                onClick={() => {
                  setForm({ id: null, nombre: "", tipo: "polvo", precio_hora: "", disponible: true });
                  setOpenDialog(true);
                }}
              >
                ➕ Nueva Cancha
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Precio/h</TableCell>
                    <TableCell>Disponible</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {canchas
                    .slice(pageC * rowsPerPageC, pageC * rowsPerPageC + rowsPerPageC)
                    .map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.nombre}</TableCell>
                        <TableCell>{c.tipo}</TableCell>
                        <TableCell>${c.precio_hora}</TableCell>
                        <TableCell>{c.disponible ? "Sí" : "Mantenimiento"}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => { setForm(c); setOpenDialog(true); }}>
                            <Edit />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(c.id)}>
                            <Delete />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => toggleMantenimiento(c)}>
                            <BuildCircle />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={canchas.length}
              page={pageC}
              onPageChange={handleChangePageC}
              rowsPerPage={rowsPerPageC}
              onRowsPerPageChange={handleChangeRowsPerPageC}
              labelRowsPerPage="Canchas por página:"
            />
          </>
        )}

        {/* 🟢 TAB RESERVAS */}
        {tab === 1 && (
          <>
            <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
              <TextField
                select
                label="Filtrar por cancha"
                value={filtroCancha}
                onChange={(e) => setFiltroCancha(e.target.value)}
                sx={{ width: 250 }}
              >
                <MenuItem value="">Todas</MenuItem>
                {canchas.map((c) => (
                  <MenuItem key={c.id} value={c.nombre}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cancha</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Inicio</TableCell>
                    <TableCell>Fin</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservasFiltradas
                    .slice(pageR * rowsPerPageR, pageR * rowsPerPageR + rowsPerPageR)
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.cancha_nombre}</TableCell>
                        <TableCell>{r.usuario_nombre}</TableCell>
                        <TableCell>{r.fecha}</TableCell>
                        <TableCell>{r.hora_inicio}</TableCell>
                        <TableCell>{r.hora_fin}</TableCell>
                        <TableCell>{r.estado}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => cancelarReserva(r.id)}
                            disabled={r.estado === "cancelada"}
                          >
                            Cancelar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={reservasFiltradas.length}
              page={pageR}
              onPageChange={handleChangePageR}
              rowsPerPage={rowsPerPageR}
              onRowsPerPageChange={handleChangeRowsPerPageR}
              labelRowsPerPage="Reservas por página:"
            />
          </>
        )}
      </Container>

      {/* 🟢 DIALOG NUEVA / EDITAR CANCHA */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{form.id ? "Editar Cancha" : "Crear Cancha"}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "grid", gap: 2, mt: 2, minWidth: 400 }}
          >
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <TextField
              select
              label="Tipo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <MenuItem value="polvo">Polvo de ladrillo</MenuItem>
              <MenuItem value="cemento">Cemento</MenuItem>
              <MenuItem value="sintetico">Sintético</MenuItem>
            </TextField>
            <TextField
              label="Precio por hora"
              type="number"
              value={form.precio_hora}
              onChange={(e) => setForm({ ...form, precio_hora: e.target.value })}
              inputProps={{ step: "0.01" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {form.id ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}





















