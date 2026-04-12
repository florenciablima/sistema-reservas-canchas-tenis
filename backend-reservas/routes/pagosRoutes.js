const express = require("express");
const router = express.Router();
const pagosController = require("../controllers/pagosController");

router.post("/mercadopago", pagosController.crearPago);
router.post("/efectivo", pagosController.pagoEfectivo);
router.post("/confirmar", pagosController.confirmarPago);

module.exports = router;