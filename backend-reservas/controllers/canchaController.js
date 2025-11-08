const connection = require("../models/db");
const dayjs = require("dayjs");

// ✅ Listar canchas
exports.listar = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT id, nombre, tipo, precio_hora, disponible FROM canchas"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Crear cancha
exports.crear = async (req, res) => {
  try {
    const { nombre, tipo, precio_hora, disponible } = req.body;
    const [result] = await connection.promise().query(
      "INSERT INTO canchas (nombre, tipo, precio_hora, disponible) VALUES (?, ?, ?, ?)",
      [nombre, tipo, precio_hora || 0, disponible ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Actualizar cancha
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, precio_hora, disponible } = req.body;
    await connection.promise().query(
      "UPDATE canchas SET nombre=?, tipo=?, precio_hora=?, disponible=? WHERE id=?",
      [nombre, tipo, precio_hora, disponible, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Eliminar cancha
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    await connection.promise().query("DELETE FROM canchas WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Consultar disponibilidad real (con detección exacta de reservas)
exports.disponibilidad = async (req, res) => {
  try {
    const { cancha_id } = req.query;
    if (!cancha_id)
      return res.status(400).json({ error: "Falta el ID de la cancha" });

    const hoy = dayjs().format("YYYY-MM-DD");

    // ⏰ Traer todas las reservas activas de esa cancha para hoy
    const [reservas] = await connection.promise().query(
      `SELECT hora_inicio, hora_fin FROM reservas 
       WHERE cancha_id = ? AND fecha = ? AND estado != 'cancelada'`,
      [cancha_id, hoy]
    );

    // 📅 Generar los bloques horarios
    const bloques = [];
    for (let hora = 8; hora < 20; hora++) {
      const inicio = dayjs(`${hoy} ${hora}:00:00`);
      const fin = inicio.add(1, "hour");

      // 🔍 Comprobación directa con los valores MySQL (sin confusión de zonas)
      const ocupada = reservas.some((r) => {
        const rInicio = dayjs(`${hoy} ${r.hora_inicio}`);
        const rFin = dayjs(`${hoy} ${r.hora_fin}`);
        return (
          (inicio.isSame(rInicio) || inicio.isAfter(rInicio)) &&
          inicio.isBefore(rFin)
        );
      });

      bloques.push({
        inicio: inicio.format("YYYY-MM-DDTHH:mm"),
        fin: fin.format("YYYY-MM-DDTHH:mm"),
        estado: ocupada ? "ocupada" : "disponible",
      });
    }

    res.json(bloques);
  } catch (err) {
    console.error("Error al generar disponibilidad:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};







