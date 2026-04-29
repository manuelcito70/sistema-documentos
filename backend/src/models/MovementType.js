const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MovementType = sequelize.define('MovementType', {
    id_tipo_movimiento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_tipo_movimiento'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'movement_types',
    timestamps: false
});

module.exports = MovementType;
