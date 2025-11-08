const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const header = req.headers["authorization"];
  console.log("🔹 Header recibido:", header);
  if (!header) return res.status(401).json({ error: "Token requerido" });

  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token válido:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token inválido:", err.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};
