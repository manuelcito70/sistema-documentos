const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogosController');
const auth = require('../middleware/authMiddleware'); // Opcional, si quieres que requieran login

// Todas las rutas de catálogo (generalmente requieren estar autenticado)
router.get('/roles', auth, catalogosController.getRoles);
router.get('/departments', auth, catalogosController.getDepartments);
router.get('/document-types', auth, catalogosController.getDocumentTypes);
router.get('/document-statuses', auth, catalogosController.getDocumentStatuses);
router.get('/document-priorities', auth, catalogosController.getDocumentPriorities);
router.get('/movement-types', auth, catalogosController.getMovementTypes);

module.exports = router;
