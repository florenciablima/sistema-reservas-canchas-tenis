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

// ✅ DISPONIBILIDAD COMPLETA CON MANTENIMIENTO
exports.disponibilidad = async (req, res) => {
  try {
    const { cancha_id, fecha } = req.query;

    if (!cancha_id) {
      return res.status(400).json({ error: "Falta el ID de la cancha" });
    }

    const fechaConsulta = fecha || dayjs().format("YYYY-MM-DD");

    // 🔴 Verificar si la cancha está en mantenimiento
    const [[cancha]] = await connection.promise().query(
      "SELECT disponible FROM canchas WHERE id = ?",
      [cancha_id]
    );

    const bloques = [];

    // 🚧 Si está en mantenimiento → bloquear todo
    if (!cancha || cancha.disponible === 0) {
      for (let hora = 8; hora < 22; hora++) {
        const horaInicio = `${String(hora).padStart(2, "0")}:00:00`;
        const horaFin = `${String(hora + 1).padStart(2, "0")}:00:00`;

        bloques.push({
          inicio: `${fechaConsulta}T${horaInicio}`,
          fin: `${fechaConsulta}T${horaFin}`,
          estado: "mantenimiento",
        });
      }

      return res.json(bloques);
    }

    // Traer reservas activas
    const [reservas] = await connection.promise().query(
      `SELECT hora_inicio, hora_fin 
       FROM reservas 
       WHERE cancha_id = ? 
       AND fecha = ? 
       AND estado != 'cancelada'`,
      [cancha_id, fechaConsulta]
    );

    for (let hora = 8; hora < 22; hora++) {
      const horaInicio = `${String(hora).padStart(2, "0")}:00:00`;
      const horaFin = `${String(hora + 1).padStart(2, "0")}:00:00`;

      const ocupada = reservas.some((r) => {
        return horaInicio >= r.hora_inicio && horaInicio < r.hora_fin;
      });

      bloques.push({
        inicio: `${fechaConsulta}T${horaInicio}`,
        fin: `${fechaConsulta}T${horaFin}`,
        estado: ocupada ? "ocupada" : "disponible",
      });
    }

    res.json(bloques);
  } catch (err) {
    console.error("Error al generar disponibilidad:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};







