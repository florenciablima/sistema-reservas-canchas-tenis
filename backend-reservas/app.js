const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// rutas
const userRoutes = require("./routes/userRoutes");
const canchaRoutes = require("./routes/canchaRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const pagosRoutes = require("./routes/pagosRoutes");

// 🔥 ORDEN CORRECTO (todas antes del listen)
app.use("/api/usuarios", userRoutes);
app.use("/api/canchas", canchaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/pagos", pagosRoutes);

// servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
