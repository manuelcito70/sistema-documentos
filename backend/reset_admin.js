/**
 * Script para reiniciar la contraseña del admin y crear usuarios de prueba.
 * Ejecuta: node reset_admin.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./src/config/database');
const { User, Role } = require('./src/models');

async function resetAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // Hashear la nueva contraseña
        const hash = await bcrypt.hash('admin123', 10);
        const hashUsuario = await bcrypt.hash('1234', 10);

        // Actualizar admin
        const [rowsUpdated] = await User.update(
            { password_hash: hash },
            { where: { username: 'admin' } }
        );

        if (rowsUpdated > 0) {
            console.log('✅ Contraseña del admin actualizada a: admin123');
        } else {
            console.log('⚠️  No se encontró el usuario admin. Creando...');
            const adminRole = await Role.findOne({ where: { nombre: 'admin' } });
            await User.create({
                username: 'admin',
                email: 'admin@fini.uagrm.edu.bo',
                password_hash: 'admin123',
                id_rol: adminRole ? adminRole.id_rol : null,
                nombre: 'Administrador del Sistema',
                cargo: 'Administrador',
                activo: true,
                is_verified: true
            });
            console.log('✅ Admin creado con contraseña: admin123');
        }

        // Crear usuario manuel si no existe
        const existe = await User.findOne({ where: { username: 'manuel' } });
        if (!existe) {
            const externoRole = await Role.findOne({ where: { nombre: 'externo' } });
            await User.create({
                username: 'manuel',
                email: 'manuel@fini.uagrm.edu.bo',
                password_hash: '1234',
                id_rol: externoRole ? externoRole.id_rol : null,
                nombre: 'Manuel',
                cargo: 'Externo',
                activo: true,
                is_verified: true
            });
            console.log('✅ Usuario "manuel" creado con contraseña: 1234');
        } else {
            await User.update(
                { password_hash: hashUsuario },
                { where: { username: 'manuel' } }
            );
            console.log('✅ Contraseña del usuario "manuel" reiniciada a: 1234');
        }

        console.log('\n🎉 ¡Listo! Ahora puedes iniciar sesión con:');
        console.log('   👤 admin     →  contraseña: admin123');
        console.log('   👤 manuel    →  contraseña: 1234');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetAdmin();
