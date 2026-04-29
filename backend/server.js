require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sequelize = require("./src/config/database");
const { seedUsers } = require("./src/controllers/authController");
// Importar modelos con relaciones definidas
const models = require("./src/models");

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Permite servir archivos estáticos (uploads) a otro origen

// Límite de peticiones (Rate Limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300, // Límite de peticiones por IP cada 15 min
    message: { mensaje: "Demasiadas peticiones desde esta IP, por favor intenta más tarde." }
});
app.use("/api", limiter); // Aplicar solo a rutas API

// Middleware globales
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Permitir peticiones sin origin (Postman, etc.) y orígenes en la lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Servir archivos estáticos
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// Importar rutas
const authRoutes = require("./src/routes/authRoutes");
const documentosRoutes = require("./src/routes/documentosRoutes");
const catalogosRoutes = require("./src/routes/catalogosRoutes");
const notificationsRoutes = require("./src/routes/notificationsRoutes");

// Usar rutas
app.use("/api", authRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/notificaciones", notificationsRoutes);

const PORT = process.env.PORT || 3000;

// Sincronizar base de datos y arrancar servidor
const alterDatabase = process.env.NODE_ENV !== "production";

sequelize.sync({ alter: alterDatabase })
  .then(async () => {
    console.log(`Base de datos sincronizada (alter: ${alterDatabase})`);
    // await seedUsers(); // Desactivado para producción: No crear usuarios simulados

    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos:", error);
  });
