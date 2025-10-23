const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "sistema_reservas",
  multipleStatements: false
});

connection.connect(err => {
  if (err) {
    console.error("❌ Error al conectar con MySQL:", err.message);
    return;
  }
  console.log("✅ Conexión exitosa a MySQL");
});

module.exports = connection;