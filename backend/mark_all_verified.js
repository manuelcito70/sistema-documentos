require('dotenv').config();
const sequelize = require('./src/config/database');
const User = require('./src/models/User');

async function markAllVerified() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // Actualizar todos los usuarios para marcarlos como verificados
        const [updatedCount] = await User.update(
            { isVerified: true },
            { where: {} } // Sin condición = todos los usuarios
        );

        console.log(`✅ ${updatedCount} usuarios marcados como verificados`);

        // Mostrar usuarios actualizados
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'isVerified']
        });

        console.log('\n📋 Usuarios en la base de datos:');
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.email}) - Verificado: ${user.isVerified}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

markAllVerified();
