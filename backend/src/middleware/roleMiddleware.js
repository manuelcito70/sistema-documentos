// Middleware para verificar roles de usuario
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ mensaje: 'No autenticado' });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para realizar esta acción. Contacta al administrador.'
            });
        }

        next();
    };
};

module.exports = { requireRole };
