const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

//Crear usuario (registro)
router.post("/register", userController.register);

//Iniciar sesión
router.post("/login", userController.login);


//Listar usuarios (solo admin)
router.get("/", auth, admin, userController.listarUsuarios);

module.exports = router;