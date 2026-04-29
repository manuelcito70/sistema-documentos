require('dotenv').config();
const { sendVerificationEmail } = require('./src/services/emailService');

async function integrationTest() {
    console.log('--- Integración Email Service ---');
    try {
        const dest = process.env.EMAIL_USER; // Enviar a sí mismo
        console.log(`Enviando a ${dest}...`);
        await sendVerificationEmail(dest, 'token-de-prueba-123456');
        console.log('✅ Integración exitosa: La función exportada funciona.');
    } catch (error) {
        console.error('❌ Fallo en la integración:', error);
    }
}

integrationTest();
