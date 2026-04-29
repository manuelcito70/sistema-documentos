const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");

function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ mensaje: "Token faltante" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ mensaje: "Formato inválido. Usa: Bearer <token>" });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // decoded debe tener { id, username, rol, ... }
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: "Sesión expirada, por favor inicia sesión nuevamente" });
        }
        return res.status(401).json({ mensaje: "Token inválido" });
    }
}

module.exports = auth;
