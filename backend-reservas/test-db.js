const connection = require("./models/db");

connection.query("SELECT NOW() AS fecha_actual", (err, results) => {
  if (err) {
    console.error("❌ Error ejecutando consulta:", err);
  } else {
    console.log("✅ Resultado de prueba:", results[0].fecha_actual);
  }
  connection.end();
});