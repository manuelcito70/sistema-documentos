const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { BCRYPT_ROUNDS } = require('../config/config');

const User = sequelize.define('User', {
    id_usuario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id_usuario'
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: { msg: 'El nombre de usuario ya está en uso' },
        validate: {
            notEmpty: { msg: 'El nombre de usuario no puede estar vacío' },
            len: { args: [3, 100], msg: 'El nombre de usuario debe tener entre 3 y 100 caracteres' }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: { msg: 'El email ya está registrado' },
        validate: {
            isEmail: { msg: 'Debe ser un email válido' },
            notEmpty: { msg: 'El email no puede estar vacío' }
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La contraseña no puede estar vacía' }
        }
    },
    id_rol: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_rol',
        references: { model: 'roles', key: 'id_rol' }
    },
    id_departamento: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'id_departamento',
        references: { model: 'departments', key: 'id_departamento' }
    },
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    cargo: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ultimo_acceso'
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_verified'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,        // Habilita soft delete automático con deleted_at
    deletedAt: 'deleted_at',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        }
    }
});

// Validar contraseña
User.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Ocultar campos sensibles al serializar
User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.deleted_at;
    return values;
};

module.exports = User;
