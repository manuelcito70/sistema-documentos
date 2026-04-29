const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentPriority = sequelize.define('DocumentPriority', {
    id_prioridad: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_prioridad'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'document_priorities',
    timestamps: false
});

module.exports = DocumentPriority;
