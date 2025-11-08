const express = require("express");
const router = express.Router();
const reservaController = require("../controllers/reservaController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

//Cualquiera autenticado puede crear una reserva
router.post("/", auth, reservaController.crearReserva);

//El usuario autenticado puede ver sus reservas
router.get("/mias", auth, reservaController.listarPorUsuario);

//El admin puede ver todas las reservas
router.get("/", auth, admin, reservaController.listarTodas);

//El admin puede cambiar el estado (confirmar / cancelar)
router.put("/:id", auth, admin, reservaController.actualizarReserva);

//El usuario puede cancelar su propia reserva
router.delete("/:id", auth, reservaController.cancelarReserva);

// CANCELAR reserva por usuario (ruta explícita)
router.put("/:id/cancelar", auth, reservaController.cancelarReserva);

module.exports = router;
