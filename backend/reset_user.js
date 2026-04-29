const { User, VerificationToken } = require('./src/models');
const sequelize = require('./src/config/database');

async function resetUser() {
    try {
        await sequelize.authenticate();

        const email = 'oriente.ea678@gmail.com';
        const user = await User.findOne({ where: { email } });

        if (user) {
            console.log(`Encontrado usuario ${user.username} (${user.email}). Eliminando para reinicio limpio...`);
            // El delete en cascada debería encargarse del token, pero lo hacemos explícito por seguridad
            await VerificationToken.destroy({ where: { userId: user.id } });
            await user.destroy();
            console.log('✅ Usuario eliminado. Ahora puedes registrarte de nuevo y recibirás el correo.');
        } else {
            console.log('ℹ️ El usuario no existe, puedes proceder al registro.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

resetUser();
