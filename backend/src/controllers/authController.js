const { SECRET_KEY } = require("../config/config");
const { User, Role, Department, VerificationToken } = require("../models");
const { sendVerificationEmail } = require("../services/emailService");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            where: { 
                [Op.or]: [
                    { username: username },
                    { email: username }
                ]
            },
            include: [
                { model: Role, as: 'rol', attributes: ['id_rol', 'nombre'] },
                { model: Department, as: 'departamento', attributes: ['id_departamento', 'nombre'] }
            ]
        });

        if (!user) {
            return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        // Verificar contraseña
        const passwordValida = await user.validarPassword(password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        // Actualizar último acceso
        await user.update({ ultimo_acceso: new Date() });

        // El rol ahora viene de la tabla de roles
        const rolNombre = user.rol ? user.rol.nombre : 'interno';

        const token = jwt.sign(
            {
                id: user.id_usuario,
                username: user.username,
                rol: rolNombre,
                nombre: user.nombre
            },
            SECRET_KEY,
            { expiresIn: "8h" }
        );

        return res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            token,
            user: {
                id: user.id_usuario,
                username: user.username,
                email: user.email,
                rol: rolNombre,
                nombre: user.nombre,
                cargo: user.cargo,
                departamento: user.departamento ? user.departamento.nombre : null
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const verificationRecord = await VerificationToken.findOne({ where: { token } });

        if (!verificationRecord) {
            return res.status(400).json({ mensaje: "Token de verificación inválido o expirado" });
        }

        const user = await User.findByPk(verificationRecord.id_usuario);

        if (!user) {
            return res.status(400).json({ mensaje: "Usuario no encontrado" });
        }

        user.is_verified = true;
        await user.save();

        await verificationRecord.destroy();

        return res.json({ mensaje: "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión." });
    } catch (error) {
        console.error("Error al verificar email:", error);
        return res.status(500).json({ mensaje: "Error al verificar la cuenta" });
    }
};

const register = async (req, res) => {
    const { username, email, password, rol, nombre, cargo, telefono } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ mensaje: "El usuario ya existe" });
        }

        // Verificar si el email ya existe
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ mensaje: "El email ya está registrado" });
        }

        // Buscar el rol en la tabla roles
        const rolNombre = rol || 'interno';
        const roleRecord = await Role.findOne({ where: { nombre: rolNombre } });

        const user = await User.create({
            username,
            email,
            password_hash: password, // El hook lo encriptará automáticamente
            id_rol: roleRecord ? roleRecord.id_rol : null,
            nombre,
            cargo,
            telefono,
            activo: true,
            is_verified: true // Verificación automática
        });

        return res.status(201).json({
            mensaje: "¡Registro exitoso! Ya puedes iniciar sesión.",
            user: {
                id: user.id_usuario,
                username: user.username,
                email: user.email,
                rol: rolNombre
            }
        });

    } catch (error) {
        console.error("Error al registrar:", error);

        if (error.name === 'SequelizeValidationError') {
            const errores = error.errors.map(err => err.message);
            return res.status(400).json({ mensaje: errores.join(', ') });
        }

        return res.status(500).json({ mensaje: "Error al registrar usuario" });
    }
};

const getProtected = (req, res) => {
    res.json({ mensaje: `Hola ${req.user.username}, estás autorizado`, user: req.user });
};

// Seed inicial de usuarios
const seedUsers = async () => {
    try {
        const count = await User.count();
        if (count === 0) {
            // Buscar roles
            const adminRole = await Role.findOne({ where: { nombre: 'admin' } });
            const internoRole = await Role.findOne({ where: { nombre: 'interno' } });
            const externoRole = await Role.findOne({ where: { nombre: 'externo' } });

            await User.bulkCreate([
                {
                    username: "admin",
                    email: "admin@fini.uagrm.edu.bo",
                    password_hash: "admin123",
                    id_rol: adminRole ? adminRole.id_rol : null,
                    nombre: "Administrador del Sistema",
                    cargo: "Administrador",
                    activo: true,
                    is_verified: true
                },
                {
                    username: "interno1",
                    email: "interno1@fini.uagrm.edu.bo",
                    password_hash: "1234",
                    id_rol: internoRole ? internoRole.id_rol : null,
                    nombre: "Usuario Interno",
                    cargo: "Administrativo",
                    activo: true,
                    is_verified: true
                },
                {
                    username: "externo1",
                    email: "externo1@fini.uagrm.edu.bo",
                    password_hash: "1234",
                    id_rol: externoRole ? externoRole.id_rol : null,
                    nombre: "Usuario Externo",
                    cargo: "Visitante",
                    activo: true,
                    is_verified: true
                },
            ], {
                individualHooks: true
            });
            console.log("✅ Usuarios demo creados con contraseñas encriptadas");
        }
    } catch (error) {
        console.error("❌ Error al sembrar usuarios:", error);
    }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Role, as: 'rol', attributes: ['id_rol', 'nombre'] },
                { model: Department, as: 'departamento', attributes: ['id_departamento', 'nombre'] }
            ],
            order: [['created_at', 'DESC']]
        });
        const mappedUsers = users.map(user => ({
            id: user.id_usuario,
            nombre: user.nombre,
            cargo: user.cargo,
            email: user.email,
            username: user.username,
            rol: user.rol ? user.rol.nombre : null,
            departamento: user.departamento ? user.departamento.nombre : null,
            activo: user.activo,
            ultimoAcceso: user.ultimo_acceso
        }));
        return res.json(mappedUsers);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return res.status(500).json({ mensaje: "Error al obtener usuarios" });
    }
};

const searchUsers = async (req, res) => {
    const { query } = req.query;

    try {
        if (!query || query.length < 2) {
            return res.json([]);
        }

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${query}%` } },
                    { cargo: { [Op.iLike]: `%${query}%` } },
                    { username: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } }
                ]
            },
            attributes: ['id_usuario', 'nombre', 'cargo', 'email'],
            include: [
                { model: Role, as: 'rol', attributes: ['nombre'] },
                { model: Department, as: 'departamento', attributes: ['nombre'] }
            ],
            limit: 20,
            order: [['nombre', 'ASC']]
        });
        const mappedUsers = users.map(user => ({
            id: user.id_usuario,
            nombre: user.nombre,
            cargo: user.cargo,
            email: user.email,
            username: user.username,
            rol: user.rol ? user.rol.nombre : null,
            departamento: user.departamento ? user.departamento.nombre : null
        }));

        return res.json(mappedUsers);
    } catch (error) {
        console.error("❌ Error al buscar usuarios:", error);
        return res.status(500).json({ mensaje: "Error al buscar usuarios" });
    }
};

module.exports = {
    login,
    register,
    verifyEmail,
    getProtected,
    seedUsers,
    getAllUsers,
    searchUsers
};
