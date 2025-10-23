const connection = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan datos" });

    const [exists] = await connection.promise().query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ error: "Email ya registrado" });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await connection.promise().query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashed]
    );

    res.status(201).json({ id: result.insertId, nombre, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await connection.promise().query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, id: user.id, nombre: user.nombre, rol: user.rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};