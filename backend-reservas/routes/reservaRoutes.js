const express = require("express");
const router = express.Router();
const reservaController = require("../controllers/reservaController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

// ==============================
// CREAR RESERVA
// ==============================
router.post("/", auth, reservaController.crearReserva);

// ==============================
// MIS RESERVAS
// ==============================
router.get("/mias", auth, reservaController.listarPorUsuario);

// ==============================
// ADMIN - TODAS
// ==============================
router.get("/", auth, admin, reservaController.listarTodas);

// ==============================
// ACTUALIZAR ESTADO
// ==============================
router.put("/:id", auth, admin, reservaController.actualizarReserva);

// ==============================
// CANCELAR
// ==============================
router.put("/:id/cancelar", auth, reservaController.cancelarReserva);

// (opcional si lo usás desde otro lado)
router.delete("/:id", auth, reservaController.cancelarReserva);

// ==============================
// 🔥 MARCAR COMO PAGADA (CORREGIDO)
// ==============================
router.put("/:id/pagar", auth, admin, reservaController.marcarPagada);

module.exports = router;