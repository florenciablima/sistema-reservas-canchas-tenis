const connection = require("../models/db");

// ==============================
// CREAR RESERVA + ORDEN DE PAGO
// ==============================
exports.crearReserva = async (req, res) => {
  try {
    const { cancha_id, fecha, hora_inicio, hora_fin, metodo_pago } = req.body;
    const usuario_id = req.user.id;

    if (!cancha_id || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const fechaSQL = fecha.split("T")[0];

    // VALIDACIÓN FECHA
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [anio, mes, dia] = fechaSQL.split("-");
    const fechaReserva = new Date(anio, mes - 1, dia);
    fechaReserva.setHours(0, 0, 0, 0);

    if (fechaReserva < hoy) {
      return res.status(400).json({
        error: "No se pueden reservar fechas pasadas",
      });
    }

    const maxFecha = new Date();
    maxFecha.setDate(maxFecha.getDate() + 14);
    maxFecha.setHours(0, 0, 0, 0);

    if (fechaReserva > maxFecha) {
      return res.status(400).json({
        error: "Solo 14 días de anticipación",
      });
    }

    // VALIDAR HORARIO
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({
        error: "Hora inicio debe ser menor",
      });
    }

    // VALIDAR QUE LA HORA NO HAYA PASADO SI ES HOY
    const hoyStr = new Date().toISOString().split("T")[0];
    if (fechaSQL === hoyStr) {
      const horaActual = new Date().getHours();
      const horaInicioNum = parseInt(hora_inicio.split(":")[0], 10);
      if (horaInicioNum < horaActual) {
        return res.status(400).json({
          error: "No podés reservar un horario que ya pasó",
        });
      }
    }

    // DISPONIBILIDAD
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
        error: "Horario ocupado",
      });
    }

    // CREAR RESERVA
    const [result] = await connection.promise().query(
      `INSERT INTO reservas 
       (usuario_id, cancha_id, fecha, hora_inicio, hora_fin, estado)
       VALUES (?, ?, ?, ?, ?, 'confirmada')`,
      [usuario_id, cancha_id, fechaSQL, hora_inicio, hora_fin]
    );

    const reservaId = result.insertId;

    // OBTENER PRECIO
    const [cancha] = await connection.promise().query(
      "SELECT precio_hora FROM canchas WHERE id = ?",
      [cancha_id]
    );

    const precio = cancha[0]?.precio_hora || 0;

    // CREAR PAGO
    const [pagoResult] = await connection.promise().query(
      `INSERT INTO pagos (usuario_id, reserva_id, monto, metodo, estado)
       VALUES (?, ?, ?, ?, 'pendiente')`,
      [usuario_id, reservaId, precio, metodo_pago || 'efectivo']
    );

    const pagoId = pagoResult.insertId;

    res.status(201).json({
      message: "Reserva creada correctamente",
      reserva_id: reservaId,
      pago_id: pagoId,
    });

  } catch (err) {
    console.error("Error al crear reserva:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// ==============================
// MIS RESERVAS
// ==============================
exports.listarPorUsuario = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [rows] = await connection.promise().query(
      `SELECT 
         r.*, 
         c.nombre AS cancha_nombre,
         p.estado AS pago_estado,
         p.monto
       FROM reservas r 
       JOIN canchas c ON r.cancha_id = c.id
       LEFT JOIN pagos p ON r.id = p.reserva_id
       WHERE r.usuario_id = ?
       ORDER BY r.fecha DESC, r.hora_inicio DESC`,
      [usuario_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// ADMIN - TODAS
// ==============================
exports.listarTodas = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT 
        r.*, 
        u.nombre AS usuario_nombre,
        c.nombre AS cancha_nombre,
        p.estado AS pago_estado
      FROM reservas r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN canchas c ON r.cancha_id = c.id
      LEFT JOIN pagos p ON r.id = p.reserva_id
      ORDER BY r.fecha DESC, r.hora_inicio DESC`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// ACTUALIZAR ESTADO (ADMIN)
// ==============================
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
    console.error("Error actualizarReserva:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// ==============================
// CANCELAR RESERVA
// ==============================
exports.cancelarReserva = async (req, res) => {
  try {
    const id = req.params.id;

    await connection.promise().query(
      "UPDATE reservas SET estado = 'cancelada' WHERE id = ?",
      [id]
    );

    await connection.promise().query(
      "UPDATE pagos SET estado = 'cancelado' WHERE reserva_id = ?",
      [id]
    );

    res.json({ message: "Reserva cancelada" });

  } catch (err) {
    console.error("Error cancelarReserva:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// ==============================
// MARCAR COMO PAGADA (ADMIN)
// ==============================
exports.marcarPagada = async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await connection.promise().query(
      `UPDATE pagos 
       SET estado = 'pagado', fecha_pago = NOW()
       WHERE reserva_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    res.json({ message: "Pago marcado como pagado" });

  } catch (err) {
    console.error("Error marcarPagada:", err);
    res.status(500).json({ error: "Error interno" });
  }
};