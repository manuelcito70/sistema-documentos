const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VerificationToken = sequelize.define('VerificationToken', {
    id_token: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_token'
    },
    id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'id_usuario',
        references: { model: 'users', key: 'id_usuario' }
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
    }
}, {
    tableName: 'verification_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = VerificationToken;
