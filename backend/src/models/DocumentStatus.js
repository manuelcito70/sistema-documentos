const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentStatus = sequelize.define('DocumentStatus', {
    id_estado_documento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_estado_documento'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'document_statuses',
    timestamps: false
});

module.exports = DocumentStatus;
