const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentHistory = sequelize.define('DocumentHistory', {
    id_historial: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_historial'
    },
    id_documento: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'id_documento',
        references: { model: 'documents', key: 'id_documento' }
    },
    id_usuario: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_usuario',
        references: { model: 'users', key: 'id_usuario' }
    },
    accion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    campos_modificados: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'campos_modificados'
    },
    valores_anteriores: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'valores_anteriores'
    },
    valores_nuevos: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'valores_nuevos'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'document_histories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = DocumentHistory;
