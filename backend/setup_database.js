/**
 * Script de configuración completa de la base de datos.
 * Crea todas las tablas y los datos iniciales (catálogos + admin).
 * Ejecuta: node setup_database.js
 */
require('dotenv').config();
const sequelize = require('./src/config/database');

// Importar TODOS los modelos para que Sequelize los registre con sus relaciones
const {
    Role, Department, DocumentType, DocumentStatus, DocumentPriority, MovementType,
    User, Document, DocumentRecipient, DocumentAttachment, DocumentHistory,
    Notification, VerificationToken
} = require('./src/models');

async function setupDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');

        // Recrear todas las tablas (borra y crea de nuevo)
        console.log('\n⏳ Recreando tablas...');
        await sequelize.sync({ force: true });
        console.log('✅ Tablas creadas correctamente');

        // ============================================================
        // DATOS DE CATÁLOGO
        // ============================================================
        console.log('\n⏳ Insertando catálogos...');

        // Roles
        const roles = await Role.bulkCreate([
            { nombre: 'admin',    descripcion: 'Administrador del sistema con acceso total' },
            { nombre: 'interno',  descripcion: 'Usuario interno de la facultad' },
            { nombre: 'externo',  descripcion: 'Usuario externo o visitante' }
        ]);
        console.log('  ✔ Roles creados');

        // Departamentos
        await Department.bulkCreate([
            { nombre: 'Decanatura',                descripcion: 'Decanatura de la FINI' },
            { nombre: 'Secretaría',                descripcion: 'Secretaría académica' },
            { nombre: 'Docentes',                  descripcion: 'Área de docentes' },
            { nombre: 'Administración',            descripcion: 'Administración general' },
            { nombre: 'Tecnología',                descripcion: 'Departamento de Tecnología' },
            { nombre: 'Externo',                   descripcion: 'Entidad externa' }
        ]);
        console.log('  ✔ Departamentos creados');

        // Tipos de documento
        await DocumentType.bulkCreate([
            { nombre: 'Oficio',       descripcion: 'Comunicación formal entre dependencias' },
            { nombre: 'Memorándum',   descripcion: 'Comunicación interna' },
            { nombre: 'Circular',     descripcion: 'Comunicación masiva' },
            { nombre: 'Resolución',   descripcion: 'Documento de resolución oficial' },
            { nombre: 'Solicitud',    descripcion: 'Solicitud formal' },
            { nombre: 'Informe',      descripcion: 'Informe de actividades o resultados' },
            { nombre: 'Contrato',     descripcion: 'Contrato o convenio' },
            { nombre: 'Otro',         descripcion: 'Otro tipo de documento' }
        ]);
        console.log('  ✔ Tipos de documento creados');

        // Estados de documento
        await DocumentStatus.bulkCreate([
            { nombre: 'pendiente',   descripcion: 'Documento pendiente de atención',  color: '#fbbf24', orden: 1 },
            { nombre: 'proceso',     descripcion: 'Documento en proceso',              color: '#3b82f6', orden: 2 },
            { nombre: 'finalizado',  descripcion: 'Documento finalizado y archivado',  color: '#10b981', orden: 3 }
        ]);
        console.log('  ✔ Estados de documento creados');

        // Prioridades
        await DocumentPriority.bulkCreate([
            { nombre: 'baja',    descripcion: 'Prioridad baja',   color: '#6b7280', orden: 1 },
            { nombre: 'normal',  descripcion: 'Prioridad normal', color: '#3b82f6', orden: 2 },
            { nombre: 'alta',    descripcion: 'Prioridad alta',   color: '#f59e0b', orden: 3 },
            { nombre: 'urgente', descripcion: 'Urgente',          color: '#ef4444', orden: 4 }
        ]);
        console.log('  ✔ Prioridades creadas');

        // Tipos de movimiento
        await MovementType.bulkCreate([
            { nombre: 'enviado',   descripcion: 'Documento enviado por el usuario' },
            { nombre: 'recibido',  descripcion: 'Documento recibido por el usuario' }
        ]);
        console.log('  ✔ Tipos de movimiento creados');

        // ============================================================
        // USUARIOS INICIALES
        // ============================================================
        console.log('\n⏳ Creando usuarios...');

        const adminRole    = roles.find(r => r.nombre === 'admin');
        const internoRole  = roles.find(r => r.nombre === 'interno');
        const externoRole  = roles.find(r => r.nombre === 'externo');

        await User.bulkCreate([
            {
                username:      'admin',
                email:         'admin@fini.uagrm.edu.bo',
                password_hash: 'admin123',
                id_rol:        adminRole.id_rol,
                nombre:        'Administrador del Sistema',
                cargo:         'Administrador',
                activo:        true,
                is_verified:   true
            },
            {
                username:      'manuel',
                email:         'manuel@fini.uagrm.edu.bo',
                password_hash: '1234',
                id_rol:        externoRole.id_rol,
                nombre:        'Manuel',
                cargo:         'Externo',
                activo:        true,
                is_verified:   true
            },
            {
                username:      'secretaria',
                email:         'secretaria@fini.uagrm.edu.bo',
                password_hash: '1234',
                id_rol:        internoRole.id_rol,
                nombre:        'Secretaría Académica',
                cargo:         'Secretaria',
                activo:        true,
                is_verified:   true
            }
        ], { individualHooks: true }); // Activa el hook de encriptación de bcrypt

        console.log('  ✔ Usuarios creados');

        console.log('\n🎉 ¡BASE DE DATOS CONFIGURADA EXITOSAMENTE!');
        console.log('');
        console.log('   Usuarios disponibles:');
        console.log('   👤 admin       →  contraseña: admin123');
        console.log('   👤 manuel      →  contraseña: 1234');
        console.log('   👤 secretaria  →  contraseña: 1234');
        console.log('');
        console.log('   Inicia sesión en: http://localhost:5173');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error al configurar la base de datos:');
        console.error(error.message);
        process.exit(1);
    }
}

setupDatabase();
