const express = require("express");
const router = express.Router();
const canchaController = require("../controllers/canchaController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.get("/", canchaController.listar);
router.get("/disponibilidad", canchaController.disponibilidad);
router.post("/", auth, admin, canchaController.crear);
router.put("/:id", auth, admin, canchaController.actualizar);
router.delete("/:id", auth, admin, canchaController.eliminar);

module.exports = router;
