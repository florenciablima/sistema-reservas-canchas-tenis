const express = require("express");
const router = express.Router();
const reservaController = require("../controllers/reservaController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

// Crear reserva
router.post("/", auth, reservaController.crearReserva);

// Ver mis reservas
router.get("/mias", auth, reservaController.listarPorUsuario);

// Admin ve todas
router.get("/", auth, admin, reservaController.listarTodas);

// Admin actualiza estado
router.put("/:id", auth, admin, reservaController.actualizarReserva);

// Cancelar (usuario)
router.delete("/:id", auth, reservaController.cancelarReserva);

// Cancelar explícito
router.put("/:id/cancelar", auth, reservaController.cancelarReserva);

// 🔥 NUEVO
router.put("/:id/pagar", auth, admin, reservaController.marcarPagada);

module.exports = router;