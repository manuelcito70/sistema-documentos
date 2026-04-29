const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
    id_documento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_documento'
    },
    codigo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: { msg: 'El código de documento ya existe' },
        validate: { notEmpty: { msg: 'El código no puede estar vacío' } }
    },
    id_tipo_movimiento: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_tipo_movimiento',
        references: { model: 'movement_types', key: 'id_tipo_movimiento' }
    },
    id_tipo_documento: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_tipo_documento',
        references: { model: 'document_types', key: 'id_tipo_documento' }
    },
    id_estado_documento: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_estado_documento',
        references: { model: 'document_statuses', key: 'id_estado_documento' }
    },
    id_prioridad: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_prioridad',
        references: { model: 'document_priorities', key: 'id_prioridad' }
    },
    clasificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'interno',
        validate: {
            isIn: { args: [['interno', 'externo']], msg: 'La clasificación debe ser: interno o externo' }
        }
    },
    fecha_registro: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fecha_registro'
    },
    fecha_envio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'fecha_envio'
    },
    fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'fecha_vencimiento'
    },
    remitente: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: { msg: 'El remitente no puede estar vacío' } }
    },
    destinatario: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    cargo: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    quien_recibe: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'quien_recibe'
    },
    detalle: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: { msg: 'El detalle no puede estar vacío' } }
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'created_by',
        references: { model: 'users', key: 'id_usuario' }
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
    }
}, {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
});

module.exports = Document;
