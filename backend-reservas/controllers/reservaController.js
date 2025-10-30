const connection = require("../models/db");

//Crear una reserva (usuario autenticado)
exports.crearReserva = async (req, res) => {
  try {
    const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;
    const usuario_id = req.user.id; // 👈 se obtiene del token (no del body)

    if (!cancha_id || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const [result] = await connection.promise().query(
      "INSERT INTO reservas (usuario_id, cancha_id, fecha, hora_inicio, hora_fin, estado) VALUES (?, ?, ?, ?, ?, ?)",
      [usuario_id, cancha_id, fecha, hora_inicio, hora_fin, "pendiente"]
    );

    res.status(201).json({ message: "Reserva creada correctamente", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar reservas del usuario autenticado
exports.listarPorUsuario = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [rows] = await connection.promise().query(
      "SELECT r.*, c.nombre AS cancha_nombre, c.tipo AS cancha_tipo FROM reservas r JOIN canchas c ON r.cancha_id = c.id WHERE r.usuario_id = ?",
      [usuario_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar todas las reservas (solo admin)
exports.listarTodas = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT r.*, u.nombre AS usuario_nombre, c.nombre AS cancha_nombre
       FROM reservas r
       JOIN usuarios u ON r.usuario_id = u.id
       JOIN canchas c ON r.cancha_id = c.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar el estado de una reserva (solo admin)
exports.actualizarReserva = async (req, res) => {
  try {
    const id = req.params.id;
    const { estado } = req.body;

    if (!estado) return res.status(400).json({ error: "Debe indicar un estado" });

    await connection.promise().query("UPDATE reservas SET estado = ? WHERE id = ?", [estado, id]);
    res.json({ message: "Reserva actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancelar reserva (usuario)
exports.cancelarReserva = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario_id = req.user.id;

    // Validar que la reserva pertenece al usuario
    const [rows] = await connection.promise().query(
      "SELECT * FROM reservas WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (rows.length === 0)
      return res.status(403).json({ error: "No puedes cancelar reservas de otro usuario" });

    await connection.promise().query("UPDATE reservas SET estado = 'cancelada' WHERE id = ?", [id]);
    res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
