const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const connection = require("../models/db");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ==============================
// 🟢 CREAR PAGO MP (sobre pago existente)
// ==============================
exports.crearPago = async (req, res) => {
  try {
    const { pago_id } = req.body;

    if (!pago_id) {
      return res.status(400).json({ error: "Falta pago_id" });
    }

    // 🔎 obtener pago
    const [rows] = await connection.promise().query(
      "SELECT * FROM pagos WHERE id = ?",
      [pago_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    const pago = rows[0];

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: "Reserva cancha tenis",
            quantity: 1,
            unit_price: parseFloat(pago.monto),
            currency_id: "ARS",
          },
        ],
        metadata: {
          pago_id: pago.id,
        },
        back_urls: {
          success: "http://localhost:5173/pago-exitoso",
          failure: "http://localhost:5173/pago-error",
          pending: "http://localhost:5173/pago-pendiente",
        },
      },
    });

    res.json({ init_point: response.init_point });

  } catch (error) {
    console.error("ERROR MP:", error);
    res.status(500).json({ error: "Error al crear pago" });
  }
};

// ==============================
// 💵 PAGO MANUAL
// ==============================
exports.pagoEfectivo = async (req, res) => {
  try {
    const { pago_id } = req.body;

    await connection.promise().query(
      `UPDATE pagos 
       SET estado = 'pagado', metodo = 'manual', fecha_pago = NOW()
       WHERE id = ?`,
      [pago_id]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en pago efectivo" });
  }
};

// ==============================
// 🟢 CONFIRMAR PAGO MP
// ==============================
exports.confirmarPago = async (req, res) => {
  try {
    const { payment_id } = req.body;

    const payment = new Payment(client);
    const data = await payment.get({ id: payment_id });

    console.log("MP RESPONSE:", data.response);

    if (data.response.status !== "approved") {
      return res.status(400).json({ error: "Pago no aprobado" });
    }

    const pago_id = data.response.external_reference;

    if (!pago_id) {
      return res.status(400).json({ error: "Sin pago_id" });
    }

    await connection.promise().query(
      `UPDATE pagos 
       SET estado = 'pagado', metodo = 'online', fecha_pago = NOW()
       WHERE id = ?`,
      [pago_id]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error("CONFIRMAR ERROR:", error);
    res.status(500).json({ error: "Error al confirmar pago" });
  }
};