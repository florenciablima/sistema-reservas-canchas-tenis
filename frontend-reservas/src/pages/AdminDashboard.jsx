import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
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
  Paper,
  IconButton,
  TablePagination
} from "@mui/material";
import { Edit, Delete, BuildCircle, ArrowBack } from "@mui/icons-material";
import Swal from "sweetalert2";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    id: null,
    nombre: "",
    tipo: "polvo",
    precio_hora: "",
    disponible: true,
  });

  const [filtroCancha, setFiltroCancha] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [pageCanchas, setPageCanchas] = useState(0);
  const [pageReservas, setPageReservas] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // =============================
  // CARGA DATOS
  // =============================
  async function cargarDatos() {
    try {
      const resCanchas = await client.get("/canchas");
      const resReservas = await client.get("/reservas");

      setCanchas(resCanchas.data || []);
      setReservas(resReservas.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // =============================
  // CANCHAS
  // =============================
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (form.id) {
        await client.put(`/canchas/${form.id}`, form);
      } else {
        await client.post("/canchas", form);
      }

      setOpenDialog(false);
      cargarDatos();
    } catch {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  }

  async function handleDelete(id) {
    const confirmar = await Swal.fire({
      title: "¿Eliminar cancha?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirmar.isConfirmed) return;

    await client.delete(`/canchas/${id}`);
    cargarDatos();
  }

  async function toggleMantenimiento(c) {
    await client.put(`/canchas/${c.id}`, {
      ...c,
      disponible: !c.disponible,
    });

    cargarDatos();
  }

  // =============================
  // RESERVAS
  // =============================
  async function cancelarReserva(id) {
    const confirmar = await Swal.fire({
      title: "¿Cancelar reserva?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirmar.isConfirmed) return;

    await client.put(`/reservas/${id}/cancelar`);
    cargarDatos();
  }

  async function marcarPagada(id, yaPagado) {
    if (yaPagado === "pagado") return;

    try {
      await client.put(`/reservas/${id}/pagar`);
      Swal.fire("OK", "Pago registrado", "success");
      cargarDatos();
    } catch {
      Swal.fire("Error", "No se pudo marcar como pagado", "error");
    }
  }

  // =============================
  // FILTROS
  // =============================
  const reservasFiltradas = reservas.filter((r) => {
    return (
      (filtroCancha ? r.cancha_nombre === filtroCancha : true) &&
      (filtroEstado ? r.estado === filtroEstado : true)
    );
  });

  // PAGINADO
  const canchasPaginadas = canchas.slice(
    pageCanchas * rowsPerPage,
    pageCanchas * rowsPerPage + rowsPerPage
  );

  const reservasPaginadas = reservasFiltradas.slice(
    pageReservas * rowsPerPage,
    pageReservas * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/src/assets/fondo-tenis.jpg')",
        backgroundSize: "cover",
        py: 5,
      }}
    >
      <Container
        sx={{
          bgcolor: "rgba(255,255,255,0.95)",
          p: 4,
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Panel Admin</Typography>

          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            startIcon={<ArrowBack />}
          >
            Volver al inicio
          </Button>
        </Box>

        <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
          <Tab label="Canchas" />
          <Tab label="Reservas" />
        </Tabs>

        {/* ================= CANCHAS ================= */}
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
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {canchasPaginadas.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell>{c.tipo}</TableCell>
                      <TableCell>${c.precio_hora}</TableCell>
                      <TableCell>
                        {c.disponible ? "Disponible" : "Mantenimiento"}
                      </TableCell>
                      <TableCell>
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

              <TablePagination
                component="div"
                count={canchas.length}
                page={pageCanchas}
                onPageChange={(e, p) => setPageCanchas(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPageCanchas(0);
                }}
              />
            </TableContainer>
          </>
        )}

        {/* ================= RESERVAS ================= */}
        {tab === 1 && (
          <>
            {/* FILTROS GRANDES */}
            <Box sx={{ display: "flex", gap: 3, my: 3 }}>
              <TextField
                select
                label="Cancha"
                value={filtroCancha}
                onChange={(e) => setFiltroCancha(e.target.value)}
                sx={{ minWidth: 250 }}
              >
                <MenuItem value="">Todas</MenuItem>
                {canchas.map((c) => (
                  <MenuItem key={c.id} value={c.nombre}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                sx={{ minWidth: 250 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="confirmada">Confirmadas</MenuItem>
                <MenuItem value="cancelada">Canceladas</MenuItem>
              </TextField>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cancha</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Pago</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {reservasPaginadas.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.cancha_nombre}</TableCell>
                      <TableCell>{r.usuario_nombre}</TableCell>
                      <TableCell>{r.estado}</TableCell>
                      <TableCell>{r.pago_estado}</TableCell>

                      <TableCell>
                        {r.pago_metodo !== "online" && (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={r.pago_estado === "pagado"}
                            onClick={() => marcarPagada(r.id, r.pago_estado)}
                            sx={{ mr: 1 }}
                          >
                            Pagar
                          </Button>
                        )}

                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => cancelarReserva(r.id)}
                        >
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={reservasFiltradas.length}
                page={pageReservas}
                onPageChange={(e, p) => setPageReservas(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPageReservas(0);
                }}
              />
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
          <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
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
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}












