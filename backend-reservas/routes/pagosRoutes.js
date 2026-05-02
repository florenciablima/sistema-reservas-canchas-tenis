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

module.exports = router;