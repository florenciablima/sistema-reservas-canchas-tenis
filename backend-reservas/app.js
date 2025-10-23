const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// rutas
const userRoutes = require("./routes/userRoutes");
const canchaRoutes = require("./routes/canchaRoutes");
const reservaRoutes = require("./routes/reservaRoutes");

app.use("/api/usuarios", userRoutes);
app.use("/api/canchas", canchaRoutes);
app.use("/api/reservas", reservaRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
