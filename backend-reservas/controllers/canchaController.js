const connection = require("../models/db");
const dayjs = require("dayjs");

// 📋 Listar canchas
exports.listar = async (req, res) => {
  try {
    const [rows] = await connection
      .promise()
      .query("SELECT id, nombre, tipo, precio_hora, disponible FROM canchas");
    const canchas = rows.map((c) => ({ ...c, disponible: !!c.disponible }));
    res.json(canchas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ Crear cancha
exports.crear = async (req, res) => {
  try {
    const { nombre, tipo, precio_hora, disponible } = req.body;
    if (!nombre || !tipo)
      return res.status(400).json({ error: "Faltan datos obligatorios" });

    const [result] = await connection.promise().query(
      "INSERT INTO canchas (nombre, tipo, precio_hora, disponible) VALUES (?, ?, ?, ?)",
      [nombre, tipo, precio_hora || 0, disponible ? 1 : 0]
    );

    res.status(201).json({
      message: "Cancha creada correctamente",
      id: result.insertId,
      nombre,
      tipo,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Actualizar cancha
exports.actualizar = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, tipo, precio_hora, disponible } = req.body;

    await connection.promise().query(
      "UPDATE canchas SET nombre=?, tipo=?, precio_hora=?, disponible=? WHERE id=?",
      [nombre, tipo, precio_hora || 0, disponible ? 1 : 0, id]
    );

    res.json({ message: "Cancha actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Eliminar cancha
exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    await connection.promise().query("DELETE FROM canchas WHERE id = ?", [id]);
    res.json({ message: "Cancha eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🕒 Consultar disponibilidad de una cancha
// 🕒 Consultar disponibilidad de una cancha
exports.disponibilidad = async (req, res) => {
  try {
    const { cancha_id } = req.query;
    if (!cancha_id)
      return res.status(400).json({ error: "Falta el ID de la cancha" });

    // Traemos las reservas que no estén canceladas
    const [reservas] = await connection.promise().query(
      "SELECT fecha, hora_inicio, hora_fin, estado FROM reservas WHERE cancha_id = ? AND estado != 'cancelada'",
      [cancha_id]
    );

    const hoy = dayjs().format("YYYY-MM-DD");
    const bloques = [];

    // Generamos los horarios de 8 a 20 (hora local)
    for (let hora = 8; hora < 20; hora++) {
      const inicio = dayjs(`${hoy}T${String(hora).padStart(2, "0")}:00:00`);
      const fin = inicio.add(1, "hour");

      // Verificar si ese bloque ya está reservado
      const yaReservada = reservas.some(
        (r) =>
          r.fecha === hoy &&
          r.hora_inicio.slice(0, 2) === String(hora).padStart(2, "0") &&
          r.estado !== "cancelada"
      );

      bloques.push({
        inicio: inicio.format("YYYY-MM-DDTHH:mm:ss"), // mantener hora local
        fin: fin.format("YYYY-MM-DDTHH:mm:ss"),
        estado: yaReservada ? "ocupada" : "disponible",
      });
    }

    res.json(bloques);
  } catch (err) {
    console.error("Error al generar disponibilidad:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};



