const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const connection = require("../models/db");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// 🟢 CREAR PAGO (MP)
exports.crearPago = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { cancha_id, fecha, hora_inicio, hora_fin, precio } = req.body;

    // 🔒 VALIDACIÓN FUERTE
    if (!cancha_id || !fecha || !hora_inicio || !hora_fin || !precio) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: "Reserva cancha tenis",
            quantity: 1,
            unit_price: parseFloat(precio), // 🔥 FIX CLAVE
            currency_id: "ARS",
          },
        ],
        metadata: {
          cancha_id,
          fecha,
          hora_inicio,
          hora_fin,
        },
        back_urls: {
          success: "http://localhost:5173/pago-exitoso",
          failure: "http://localhost:5173/pago-error",
          pending: "http://localhost:5173/pago-pendiente",
        },
        
      },
    });

    console.log("MP RESPONSE:", response);

    res.json({ init_point: response.init_point });

  } catch (error) {
    console.error("🔥 ERROR REAL MP:", error.message);
    console.error("🔥 ERROR COMPLETO:", error);

    res.status(500).json({
      error: "Error al crear pago",
      detalle: error.message, // 🔥 ahora vas a ver el error real en frontend
    });
  }
};


// 🟢 EFECTIVO
exports.pagoEfectivo = async (req, res) => {
  try {
    const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;

    if (!cancha_id || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔒 evitar doble reserva
    const [existe] = await connection.promise().query(
      `SELECT id FROM reservas 
       WHERE cancha_id=? AND fecha=? AND hora_inicio=? AND estado!='cancelada'`,
      [cancha_id, fecha, hora_inicio]
    );

    if (existe.length > 0) {
      return res.status(400).json({ error: "Horario ya ocupado" });
    }

    const [result] = await connection.promise().query(
      `INSERT INTO reservas 
       (cancha_id, fecha, hora_inicio, hora_fin, estado, metodo_pago)
       VALUES (?, ?, ?, ?, 'confirmada', 'efectivo')`,
      [cancha_id, fecha, hora_inicio, hora_fin]
    );

    res.json({ ok: true, id: result.insertId });

  } catch (error) {
    console.error("EFECTIVO ERROR:", error);
    res.status(500).json({ error: "Error en pago efectivo" });
  }
};

// 🟢 CONFIRMAR PAGO MP
exports.confirmarPago = async (req, res) => {
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: "Falta payment_id" });
    }

    const payment = new Payment(client);
    const data = await payment.get({ id: payment_id });

    // 🔥 IMPORTANTE: verificar estado del pago
    if (data.response.status !== "approved") {
      return res.status(400).json({ error: "Pago no aprobado" });
    }

    const meta = data.response.metadata;

    if (!meta) {
      return res.status(400).json({ error: "Sin metadata" });
    }

    // 🔒 evitar duplicados
    const [existe] = await connection.promise().query(
      `SELECT id FROM reservas 
       WHERE cancha_id=? AND fecha=? AND hora_inicio=?`,
      [meta.cancha_id, meta.fecha, meta.hora_inicio]
    );

    if (existe.length > 0) {
      return res.json({ ok: true, message: "Reserva ya creada" });
    }

    await connection.promise().query(
      `INSERT INTO reservas 
       (cancha_id, fecha, hora_inicio, hora_fin, estado, metodo_pago)
       VALUES (?, ?, ?, ?, 'confirmada', 'mercadopago')`,
      [meta.cancha_id, meta.fecha, meta.hora_inicio, meta.hora_fin]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error("CONFIRMAR ERROR:", error);
    res.status(500).json({ error: "Error al confirmar pago" });
  }
};