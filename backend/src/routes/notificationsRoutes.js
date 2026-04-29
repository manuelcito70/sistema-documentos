const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const auth = require('../middleware/authMiddleware');

// Todas estas rutas requieren autenticación
router.get('/', auth, notificationsController.getUserNotifications);
router.get('/unread-count', auth, notificationsController.getUnreadCount);
router.put('/:id/read', auth, notificationsController.markAsRead);
router.put('/mark-all-read', auth, notificationsController.markAllAsRead);

module.exports = router;
