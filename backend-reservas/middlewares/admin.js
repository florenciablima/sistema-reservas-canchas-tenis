module.exports = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Autenticación requerida" });
  if (req.user.rol !== "admin") return res.status(403).json({ error: "Acceso denegado: admin" });
  next();
};