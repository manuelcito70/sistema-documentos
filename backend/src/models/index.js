// =====================================================
// ÍNDICE DE MODELOS — Define todas las relaciones
// Sistema de Gestión de Documentos — FINI
// =====================================================

const sequelize = require('../config/database');

// Modelos de catálogo
const Role             = require('./Role');
const Department       = require('./Department');
const DocumentType     = require('./DocumentType');
const DocumentStatus   = require('./DocumentStatus');
const DocumentPriority = require('./DocumentPriority');
const MovementType     = require('./MovementType');

// Modelos principales
const User               = require('./User');
const Document           = require('./Document');
const DocumentRecipient  = require('./DocumentRecipient');
const DocumentAttachment = require('./DocumentAttachment');
const DocumentHistory    = require('./DocumentHistory');
const Notification       = require('./Notification');
const VerificationToken  = require('./VerificationToken');

// =====================================================
// RELACIONES
// =====================================================

// -- Rol → Usuarios
Role.hasMany(User, { foreignKey: 'id_rol', as: 'usuarios' });
User.belongsTo(Role, { foreignKey: 'id_rol', as: 'rol' });

// -- Departamento → Usuarios
Department.hasMany(User, { foreignKey: 'id_departamento', as: 'usuarios' });
User.belongsTo(Department, { foreignKey: 'id_departamento', as: 'departamento' });

// -- Usuario → Documentos (Creador)
User.hasMany(Document, { foreignKey: 'created_by', as: 'documentosCreados' });
Document.belongsTo(User, { foreignKey: 'created_by', as: 'creador' });

// -- Tipo de Movimiento → Documentos
MovementType.hasMany(Document, { foreignKey: 'id_tipo_movimiento', as: 'documentos' });
Document.belongsTo(MovementType, { foreignKey: 'id_tipo_movimiento', as: 'tipoMovimiento' });

// -- Tipo de Documento → Documentos
DocumentType.hasMany(Document, { foreignKey: 'id_tipo_documento', as: 'documentos' });
Document.belongsTo(DocumentType, { foreignKey: 'id_tipo_documento', as: 'tipoDocumento' });

// -- Estado → Documentos
DocumentStatus.hasMany(Document, { foreignKey: 'id_estado_documento', as: 'documentos' });
Document.belongsTo(DocumentStatus, { foreignKey: 'id_estado_documento', as: 'estado' });

// -- Prioridad → Documentos
DocumentPriority.hasMany(Document, { foreignKey: 'id_prioridad', as: 'documentos' });
Document.belongsTo(DocumentPriority, { foreignKey: 'id_prioridad', as: 'prioridad' });

// -- Documento → Destinatarios (N:M a través de document_recipients)
Document.hasMany(DocumentRecipient, { foreignKey: 'id_documento', as: 'destinatarios', onDelete: 'CASCADE' });
DocumentRecipient.belongsTo(Document, { foreignKey: 'id_documento', as: 'documento' });

User.hasMany(DocumentRecipient, { foreignKey: 'id_usuario', as: 'documentosRecibidos' });
DocumentRecipient.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });

// -- Documento → Adjuntos
Document.hasMany(DocumentAttachment, { foreignKey: 'id_documento', as: 'adjuntos', onDelete: 'CASCADE' });
DocumentAttachment.belongsTo(Document, { foreignKey: 'id_documento', as: 'documento' });

// -- Documento → Historial
Document.hasMany(DocumentHistory, { foreignKey: 'id_documento', as: 'historial', onDelete: 'CASCADE' });
DocumentHistory.belongsTo(Document, { foreignKey: 'id_documento', as: 'documento' });

User.hasMany(DocumentHistory, { foreignKey: 'id_usuario', as: 'acciones' });
DocumentHistory.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });

// -- Usuario → Notificaciones
User.hasMany(Notification, { foreignKey: 'id_usuario', as: 'notificaciones', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });

Document.hasMany(Notification, { foreignKey: 'id_documento', as: 'notificaciones' });
Notification.belongsTo(Document, { foreignKey: 'id_documento', as: 'documento' });

// -- Usuario → Tokens de Verificación
User.hasOne(VerificationToken, { foreignKey: 'id_usuario', as: 'tokenVerificacion', onDelete: 'CASCADE' });
VerificationToken.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });

// =====================================================
// EXPORTAR TODO
// =====================================================

module.exports = {
    sequelize,
    Role,
    Department,
    DocumentType,
    DocumentStatus,
    DocumentPriority,
    MovementType,
    User,
    Document,
    DocumentRecipient,
    DocumentAttachment,
    DocumentHistory,
    Notification,
    VerificationToken
};
