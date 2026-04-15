const connection = require("../models/db");

//Crear una reserva (usuario autenticado)
exports.crearReserva = async (req, res) => {
  try {
    const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;
    const usuario_id = req.user.id;

    if (!cancha_id || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const fechaSQL = fecha.split("T")[0];

    // ==============================
    // VALIDACIÓN DE FECHA
    // ==============================
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [anio, mes, dia] = fechaSQL.split("-");
    const fechaReserva = new Date(anio, mes - 1, dia);
    fechaReserva.setHours(0, 0, 0, 0);

    if (fechaReserva < hoy) {
      return res.status(400).json({
        error: "No se pueden reservar fechas pasadas"
      });
    }

    const maxFecha = new Date();
    maxFecha.setDate(maxFecha.getDate() + 14);
    maxFecha.setHours(0, 0, 0, 0);

    if (fechaReserva > maxFecha) {
      return res.status(400).json({
        error: "Solo se puede reservar con hasta 14 días de anticipación"
      });
    }

    // ==============================
    // VALIDAR HORARIO
    // ==============================
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({
        error: "La hora de inicio debe ser menor que la hora de fin"
      });
    }

    // ==============================
    // VERIFICAR DISPONIBILIDAD
    // ==============================
    const [conflictos] = await connection.promise().query(
      `SELECT * FROM reservas 
       WHERE cancha_id = ? 
       AND fecha = ? 
       AND estado != 'cancelada'
       AND (
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio >= ? AND hora_fin <= ?)
       )`,
      [
        cancha_id,
        fechaSQL,
        hora_fin,
        hora_inicio,
        hora_inicio,
        hora_fin,
        hora_inicio,
        hora_fin,
      ]
    );

    if (conflictos.length > 0) {
      return res.status(409).json({
        error: "Este horario ya está reservado. Elija otro horario disponible.",
      });
    }

    // ==============================
    // CREAR RESERVA
    // ==============================
    const [result] = await connection.promise().query(
      `INSERT INTO reservas 
       (usuario_id, cancha_id, fecha, hora_inicio, hora_fin, estado)
       VALUES (?, ?, ?, ?, ?, 'confirmada')`,
      [usuario_id, cancha_id, fechaSQL, hora_inicio, hora_fin]
    );

    res.status(201).json({
      message: "Reserva creada correctamente",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error al crear reserva:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 🔹 Listar reservas del usuario autenticado
exports.listarPorUsuario = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [rows] = await connection.promise().query(
      `SELECT 
         r.*, 
         c.nombre AS cancha_nombre, 
         c.tipo AS cancha_tipo,
         c.precio_hora AS precio_hora
       FROM reservas r 
       JOIN canchas c ON r.cancha_id = c.id 
       WHERE r.usuario_id = ?
       ORDER BY r.fecha DESC, r.hora_inicio DESC
       LIMIT 6`,
      [usuario_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error al listar reservas:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔥 LISTAR TODAS (ADMIN) — CORREGIDO
exports.listarTodas = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT 
        r.*, 
        COALESCE(u.nombre, 'Sin usuario') AS usuario_nombre,
        COALESCE(c.nombre, 'Sin cancha') AS cancha_nombre
      FROM reservas r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN canchas c ON r.cancha_id = c.id
      ORDER BY r.fecha DESC, r.hora_inicio DESC`
    );

    console.log("RESERVAS TRAIDAS:", rows);

    res.json(rows);
  } catch (err) {
    console.error("Error al listar todas:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Actualizar estado (admin)
exports.actualizarReserva = async (req, res) => {
  try {
    const id = req.params.id;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: "Debe indicar un estado" });
    }

    await connection.promise().query(
      "UPDATE reservas SET estado = ? WHERE id = ?",
      [estado, id]
    );

    res.json({ message: "Reserva actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Cancelar reserva
exports.cancelarReserva = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario_id = req.user.id;

    const [rows] = await connection.promise().query(
      "SELECT * FROM reservas WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reserva = rows[0];

    if (req.user.rol !== "admin" && reserva.usuario_id !== usuario_id) {
      return res.status(403).json({
        error: "No puedes cancelar reservas de otro usuario"
      });
    }

    if (reserva.estado === "cancelada") {
      return res.status(400).json({
        error: "La reserva ya está cancelada"
      });
    }

    await connection.promise().query(
      "UPDATE reservas SET estado = 'cancelada' WHERE id = ?",
      [id]
    );

    return res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    console.error("Error al cancelar reserva:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.marcarPagada = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE reservas 
    SET pagada = true 
    WHERE id = ?
  `;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("ERROR marcarPagada:", err);
      return res.status(500).json({ error: "Error al marcar como pagada" });
    }

    res.json({ message: "Reserva marcada como pagada" });
  });
};