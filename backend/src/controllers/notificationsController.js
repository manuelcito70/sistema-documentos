const { Notification, Document, User } = require('../models');

// Obtener todas las notificaciones del usuario logueado
const getUserNotifications = async (req, res) => {
    try {
        const notificaciones = await Notification.findAll({
            where: { id_usuario: req.user.id },
            order: [['created_at', 'DESC']],
            include: [
                { 
                    model: Document, 
                    as: 'documento', 
                    attributes: ['id_documento', 'codigo', 'remitente'] 
                }
            ]
        });
        res.json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
    }
};

// Obtener count de notificaciones no leídas
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { 
                id_usuario: req.user.id,
                leido: false
            }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al contar notificaciones' });
    }
};

// Marcar una notificación como leída
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notificacion = await Notification.findOne({
            where: {
                id_notificacion: id,
                id_usuario: req.user.id
            }
        });

        if (!notificacion) {
            return res.status(404).json({ mensaje: 'Notificación no encontrada' });
        }

        notificacion.leido = true;
        await notificacion.save();

        res.json({ mensaje: 'Notificación marcada como leída', notificacion });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar notificación' });
    }
};

// Marcar todas como leídas
const markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { leido: true },
            { where: { id_usuario: req.user.id, leido: false } }
        );
        res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar notificaciones' });
    }
};

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
