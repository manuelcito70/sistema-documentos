const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentRecipient = sequelize.define('DocumentRecipient', {
    id_destinatario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_destinatario'
    },
    id_documento: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'id_documento',
        references: { model: 'documents', key: 'id_documento' }
    },
    id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'id_usuario',
        references: { model: 'users', key: 'id_usuario' }
    },
    es_principal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'es_principal'
    },
    fecha_recepcion: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'fecha_recepcion'
    },
    leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'document_recipients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = DocumentRecipient;
