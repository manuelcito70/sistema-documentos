const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    id_notificacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_notificacion'
    },
    id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'id_usuario',
        references: { model: 'users', key: 'id_usuario' }
    },
    id_documento: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_documento',
        references: { model: 'documents', key: 'id_documento' }
    },
    tipo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Notification;
