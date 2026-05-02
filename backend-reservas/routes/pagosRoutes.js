const express = require("express");
const router = express.Router();
const pagosController = require("../controllers/pagosController");
const auth = require("../middlewares/auth");

// MP
router.post("/mercadopago", auth, pagosController.crearPago);

// efectivo
router.post("/efectivo", auth, pagosController.pagoEfectivo);

// confirmación MP
router.post("/confirmar", pagosController.confirmarPago);

const admin = require("../middlewares/admin");
router.get("/", auth, admin, pagosController.listarTodos);

module.exports = router;