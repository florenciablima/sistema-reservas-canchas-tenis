const connection = require("../models/db");
const dayjs = require("dayjs");

exports.listar = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT id, nombre, tipo, precio_hora, disponible FROM canchas"
    );
    const canchas = rows.map(c => ({ ...c, disponible: !!c.disponible }));
    res.json(canchas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, tipo, precio_hora, disponible } = req.body;
    if (!nombre || !tipo) return res.status(400).json({ error: "Faltan datos" });
    const [result] = await connection.promise().query(
      "INSERT INTO canchas (nombre, tipo, precio_hora, disponible) VALUES (?, ?, ?, ?)",
      [nombre, tipo, precio_hora || 0, disponible ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, nombre, tipo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, tipo, precio_hora, disponible } = req.body;
    await connection.promise().query(
      "UPDATE canchas SET nombre=?, tipo=?, precio_hora=?, disponible=? WHERE id=?",
      [nombre, tipo, precio_hora || 0, disponible ? 1 : 0, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    await connection.promise().query("DELETE FROM canchas WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ NUEVA FUNCIÓN: disponibilidad para el calendario
exports.disponibilidad = async (req, res) => {
  try {
    const canchaId = req.query.cancha_id;

    const [canchas] = await connection.promise().query(
      "SELECT id, nombre FROM canchas WHERE disponible = 1"
    );

    const [reservas] = await connection.promise().query(
      canchaId
        ? "SELECT cancha_id, fecha, hora_inicio, hora_fin FROM reservas WHERE cancha_id = ?"
        : "SELECT cancha_id, fecha, hora_inicio, hora_fin FROM reservas",
      canchaId ? [canchaId] : []
    );

    const bloques = [];

    for (const cancha of canchas) {
      if (canchaId && cancha.id !== Number(canchaId)) continue;

      for (let hora = 8; hora < 22; hora++) {
        const inicio = dayjs().hour(hora).minute(0).second(0);
        const fin = inicio.add(1, "hour");

        const yaReservada = reservas.some(
          (r) =>
            r.cancha_id === cancha.id &&
            dayjs(`${r.fecha} ${r.hora_inicio}`).isSame(inicio, "hour")
        );

        bloques.push({
          cancha: cancha.nombre,
          cancha_id: cancha.id,
          estado: yaReservada ? "ocupada" : "disponible",
          inicio: inicio.toISOString(),
          fin: fin.toISOString(),
        });
      }
    }

    res.json(bloques);
  } catch (err) {
    console.error("Error al generar disponibilidad:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};