const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentAttachment = sequelize.define('DocumentAttachment', {
    id_adjunto: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_adjunto'
    },
    id_documento: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'id_documento',
        references: { model: 'documents', key: 'id_documento' }
    },
    nombre_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'nombre_archivo'
    },
    archivo_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'archivo_path'
    },
    archivo_original: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'archivo_original'
    },
    archivo_tamano: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'archivo_tamano'
    },
    archivo_tipo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'archivo_tipo'
    }
}, {
    tableName: 'document_attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = DocumentAttachment;
