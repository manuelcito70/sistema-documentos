const express = require("express");
const router = express.Router();
const documentosController = require("../controllers/documentosController");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configurar Multer
// Nota: La ruta relativa aquí debe ajustarse porque estamos en /src/routes
// Vamos a usar una ruta absoluta o relativa a raíz del proyecto para uploads
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    // Permitir extensiones comunes de oficina e imagenes
    const allowedExtensions = /pdf|doc|docx|xls|xlsx|ppt|pptx|png|jpg|jpeg/i;
    const allowedMimeTypes = /pdf|msword|officedocument|ms-excel|spreadsheetml|ms-powerpoint|presentationml|image/i;

    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error("Formato de archivo no válido. Solo se permiten PDF, Word e Imágenes."));
};

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10 MB
    fileFilter
});

// Todos los usuarios autenticados pueden VER documentos
router.get("/", auth, documentosController.getAllDocuments);

// Todos los usuarios autenticados pueden CREAR documentos
router.post("/", auth, upload.single("archivo"), documentosController.createDocument);

// Solo usuarios internos y admin pueden ACTUALIZAR/EDITAR documentos
router.put("/:id", auth, requireRole('admin', 'interno'), upload.single("archivo"), documentosController.updateDocument);

// Todos los usuarios autenticados pueden ELIMINAR documentos
router.delete("/:id", auth, documentosController.deleteDocument);

module.exports = router;
