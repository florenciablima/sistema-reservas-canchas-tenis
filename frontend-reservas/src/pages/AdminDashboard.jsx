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

  // PAGINACIÓN Canchas
  const [pageC, setPageC] = useState(0);
  const [rowsPerPageC, setRowsPerPageC] = useState(5);

  // PAGINACIÓN Reservas
  const [pageR, setPageR] = useState(0);
  const [rowsPerPageR, setRowsPerPageR] = useState(5);

  // Cargar datos
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

  // Crear / editar cancha
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (form.id) {
        await client.put(`/canchas/${form.id}`, form);
      } else {
        await client.post("/canchas", form);
      }
      const res = await client.get("/canchas");
      setCanchas(res.data);
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
    }
  }

  // Eliminar cancha
  async function handleDelete(id) {
    const confirmar = await Swal.fire({
      title: "¿Eliminar cancha?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirmar.isConfirmed) return;

    await client.delete(`/canchas/${id}`);
    const res = await client.get("/canchas");
    setCanchas(res.data);
  }

  // Toggle mantenimiento
  async function toggleMantenimiento(c) {
    await client.put(`/canchas/${c.id}`, {
      ...c,
      disponible: !c.disponible,
    });
    const res = await client.get("/canchas");
    setCanchas(res.data);
  }

  // Cancelar reserva
  async function cancelarReserva(id) {
    const confirmar = await Swal.fire({
      title: "¿Cancelar reserva?",
      icon: "question",
      showCancelButton: true,
    });
    if (!confirmar.isConfirmed) return;

    await client.put(`/reservas/${id}/cancelar`);
    const res = await client.get("/reservas");
    setReservas(res.data);
  }

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
        py: 5,
      }}
    >
      <Container
        sx={{
          bgcolor: "rgba(255,255,255,0.9)",
          p: 4,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
        >
          <Typography variant="h4" color="primary">
            Panel de Administración
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver
          </Button>
        </Box>

        <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
          <Tab label="Canchas" />
          <Tab label="Reservas" />
        </Tabs>

        {/* CANCHAS */}
        {tab === 0 && (
          <>
            <Box sx={{ textAlign: "right", my: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setForm({
                    id: null,
                    nombre: "",
                    tipo: "polvo",
                    precio_hora: "",
                    disponible: true,
                  });
                  setOpenDialog(true);
                }}
              >
                Nueva Cancha
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Estado</TableCell>
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
                        <TableCell>
                          {c.disponible ? "Disponible" : "Mantenimiento"}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => { setForm(c); setOpenDialog(true); }}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(c.id)}>
                            <Delete />
                          </IconButton>
                          <IconButton onClick={() => toggleMantenimiento(c)}>
                            <BuildCircle />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* RESERVAS */}
        {tab === 1 && (
          <>
            <Box sx={{ my: 2 }}>
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
                    .map((r) => {
                      const fechaFormateada = new Date(
                        r.fecha
                      ).toLocaleDateString("es-AR");

                      return (
                        <TableRow key={r.id}>
                          <TableCell>{r.cancha_nombre}</TableCell>
                          <TableCell>{r.usuario_nombre}</TableCell>
                          <TableCell>{fechaFormateada}</TableCell>
                          <TableCell>{r.hora_inicio?.slice(0, 5)}</TableCell>
                          <TableCell>{r.hora_fin?.slice(0, 5)}</TableCell>
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
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>

      {/* DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {form.id ? "Editar Cancha" : "Nueva Cancha"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 2, minWidth: 300 }}>
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm({ ...form, nombre: e.target.value })
              }
            />
            <TextField
              select
              label="Tipo"
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value })
              }
            >
              <MenuItem value="polvo">Polvo</MenuItem>
              <MenuItem value="cemento">Cemento</MenuItem>
              <MenuItem value="sintetico">Sintético</MenuItem>
            </TextField>
            <TextField
              label="Precio"
              type="number"
              value={form.precio_hora}
              onChange={(e) =>
                setForm({ ...form, precio_hora: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}




















