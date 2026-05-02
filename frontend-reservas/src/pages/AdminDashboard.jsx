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
  const [pagos, setPagos] = useState([]);
  const [pagePagos, setPagePagos] = useState(0);
  const [filtroPagoEstado, setFiltroPagoEstado] = useState("");
  const [filtroPagoFecha, setFiltroPagoFecha] = useState("");
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
  const [filtroFecha, setFiltroFecha] = useState("");

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
      const resPagos = await client.get("/pagos");

      setCanchas(resCanchas.data || []);
      setReservas(resReservas.data || []);
      setPagos(resPagos.data || []);
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
      (filtroEstado ? r.estado === filtroEstado : true) &&
      (filtroFecha ? r.fecha && r.fecha.slice(0, 10) === filtroFecha : true)
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
          <Tab label="Pagos" />
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

              <TextField
                type="date"
                label="Fecha"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />

              {filtroFecha && (
                <Button variant="text" onClick={() => setFiltroFecha("")}>
                  Limpiar fecha
                </Button>
              )}
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cancha</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Horario</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Pago</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {reservasPaginadas.map((r) => {
                    const fecha = r.fecha
                      ? new Date(r.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
                      : "-";
                    const horario = r.hora_inicio && r.hora_fin
                      ? `${r.hora_inicio.slice(0,5)} - ${r.hora_fin.slice(0,5)}`
                      : "-";
                    const estadoPago = r.pago_estado === "pagado"
                      ? "Pagado"
                      : r.pago_estado === "cancelado"
                      ? "Cancelado"
                      : "Pendiente";
                    const estadoReserva = r.estado === "confirmada"
                      ? "Confirmada"
                      : r.estado === "cancelada"
                      ? "Cancelada"
                      : r.estado;

                    return (
                    <TableRow key={r.id}>
                      <TableCell>{r.cancha_nombre}</TableCell>
                      <TableCell>{r.usuario_nombre}</TableCell>
                      <TableCell>{fecha}</TableCell>
                      <TableCell>{horario}</TableCell>
                      <TableCell>{estadoReserva}</TableCell>
                      <TableCell>{estadoPago}</TableCell>

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
                    );
                  })}
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

        {/* ================= PAGOS ================= */}
        {tab === 2 && (() => {
        const pagosFiltrados = pagos.filter(p =>
          (filtroPagoEstado ? p.estado === filtroPagoEstado : true) &&
          (filtroPagoFecha
            ? p.fecha_reserva && p.fecha_reserva.slice(0, 10) === filtroPagoFecha
            : true)
        );
        const pagosPaginados = pagosFiltrados.slice(
          pagePagos * rowsPerPage,
          pagePagos * rowsPerPage + rowsPerPage
        );
        const totalIngresos = pagosFiltrados
          .filter(p => p.estado === "pagado")
          .reduce((acc, p) => acc + Number(p.monto || 0), 0);

        return (
          <>
            <Box sx={{ display: "flex", gap: 3, mt: 3, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                select
                label="Estado"
                value={filtroPagoEstado}
                onChange={(e) => { setFiltroPagoEstado(e.target.value); setPagePagos(0); }}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pagado">Pagados</MenuItem>
                <MenuItem value="pendiente">Pendientes</MenuItem>
                <MenuItem value="cancelado">Cancelados</MenuItem>
              </TextField>

              <TextField
                type="date"
                label="Fecha"
                value={filtroPagoFecha}
                onChange={(e) => { setFiltroPagoFecha(e.target.value); setPagePagos(0); }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />

              {filtroPagoFecha && (
                <Button variant="text" onClick={() => setFiltroPagoFecha("")}>
                  Limpiar fecha
                </Button>
              )}

              <Box sx={{ ml: "auto", p: 2, bgcolor: "#f1f8f1", border: "1px solid #c8e6c9", borderRadius: 2, textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">
                  {filtroPagoFecha
                    ? `Pagos cobrados el ${new Date(filtroPagoFecha + "T00:00:00").toLocaleDateString("es-AR")}`
                    : "Total cobrado (pagados)"}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "green" }}>
                  ${totalIngresos.toLocaleString("es-AR")}
                </Typography>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Cancha</TableCell>
                    <TableCell>Fecha reserva</TableCell>
                    <TableCell>Horario</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha pago</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagosPaginados.map((p) => {
                    const fechaReserva = p.fecha_reserva
                      ? new Date(p.fecha_reserva).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
                      : "-";
                    const horario = p.hora_inicio && p.hora_fin
                      ? `${p.hora_inicio.slice(0,5)} - ${p.hora_fin.slice(0,5)}`
                      : "-";
                    const fechaPago = p.fecha_pago
                      ? new Date(p.fecha_pago).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : "-";
                    const estadoColor = p.estado === "pagado" ? "green" : p.estado === "cancelado" ? "red" : "orange";

                    return (
                      <TableRow key={p.id}>
                        <TableCell>{p.id}</TableCell>
                        <TableCell>{p.usuario_nombre}</TableCell>
                        <TableCell>{p.cancha_nombre}</TableCell>
                        <TableCell>{fechaReserva}</TableCell>
                        <TableCell>{horario}</TableCell>
                        <TableCell>${Number(p.monto || 0).toLocaleString("es-AR")}</TableCell>
                        <TableCell>{p.metodo === "online" ? "Online" : "Efectivo"}</TableCell>
                        <TableCell sx={{ color: estadoColor, fontWeight: "bold" }}>
                          {p.estado === "pagado" ? "Pagado" : p.estado === "cancelado" ? "Cancelado" : "Pendiente"}
                        </TableCell>
                        <TableCell>{fechaPago}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={pagosFiltrados.length}
                page={pagePagos}
                onPageChange={(e, p) => setPagePagos(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPagePagos(0); }}
              />
            </TableContainer>
          </>
        );
        })()}
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







