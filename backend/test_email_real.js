require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('--- Probando Configuración de Correo ---');
    console.log('Usuario:', process.env.EMAIL_USER);
    // No mostrar contraseña por seguridad, solo longitud
    console.log('Longitud Password:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log('Host:', process.env.EMAIL_HOST);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ ERROR: Faltan credenciales en .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Intentando verificar conexión (transporter.verify)...');
        await transporter.verify();
        console.log('✅ Conexión SMTP exitosa.');

        console.log('Intentando enviar correo de prueba...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Enviarse a sí mismo
            subject: 'Prueba de Sistema - Si lees esto, funciona',
            text: 'Este es un correo de prueba para verificar que el sistema puede enviar emails correctamente.'
        });

        console.log('✅ Correo enviado exitosamente!');
        console.log('Message ID:', info.messageId);
        console.log('Revisa tu bandeja de entrada (y spam).');

    } catch (error) {
        console.error('❌ FALLÓ EL ENVÍO:');
        console.error(error);
        if (error.code === 'EAUTH') {
            console.error('--> Error de Autenticación: Tu correo o contraseña de aplicación son incorrectos.');
        }
    }
}

testEmail();
