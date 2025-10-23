const connection = require("../models/db");

exports.listar = async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT id, nombre, tipo, precio_por_hora, disponible FROM canchas");
    const canchas = rows.map(c => ({ ...c, disponible: !!c.disponible }));
    res.json(canchas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, tipo, precio_por_hora, disponible } = req.body;
    if (!nombre || !tipo) return res.status(400).json({ error: "Faltan datos" });
    const [result] = await connection.promise().query(
      "INSERT INTO canchas (nombre, tipo, precio_por_hora, disponible) VALUES (?, ?, ?, ?)",
      [nombre, tipo, precio_por_hora || 0, disponible ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, nombre, tipo });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.actualizar = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, tipo, precio_por_hora, disponible } = req.body;
    await connection.promise().query(
      "UPDATE canchas SET nombre=?, tipo=?, precio_por_hora=?, disponible=? WHERE id=?",
      [nombre, tipo, precio_por_hora || 0, disponible ? 1 : 0, id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    await connection.promise().query("DELETE FROM canchas WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};