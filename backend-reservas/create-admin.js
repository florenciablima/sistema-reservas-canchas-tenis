const connection = require("./models/db");
const bcrypt = require("bcrypt");

async function crear() {
  const nombre = "Admin";
  const email = "admin@tenis.com";
  const plain = "Admin2025*";
  const hashed = await bcrypt.hash(plain, 10);
  try {
    const [rows] = await connection.promise().query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (rows.length) {
      console.log("Admin ya existe");
      connection.end();
      return;
    }
    const [res] = await connection.promise().query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'admin')",
      [nombre, email, hashed]
    );
    console.log("Admin creado con id:", res.insertId);
  } catch (err) {
    console.error(err);
  } finally {
    connection.end();
  }
}

crear();