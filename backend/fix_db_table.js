const sequelize = require('./src/config/database');
const VerificationToken = require('./src/models/VerificationToken');

async function checkAndFixTable() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa.');

        // Forzar la creación de la tabla si no existe
        await VerificationToken.sync({ force: false });
        console.log('✅ Tabla VerificationTokens verificada/creada.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAndFixTable();
