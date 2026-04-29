const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, FRONTEND_URL } = process.env;

// Función para enviar correo de verificación
const sendVerificationEmail = async (to, token) => {
    // Re-leer env vars para asegurar que usamos las más recientes (útil si se cambia .env sin reiniciar todo el proceso)
    const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, FRONTEND_URL } = process.env;

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST || 'smtp.gmail.com',
        port: EMAIL_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    const verificationLink = `${FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    console.log(`🔗 Link de verificación (para uso local): ${verificationLink}`);
    console.log(`📧 Enviando correo a: ${to} desde ${EMAIL_USER}`);

    const mailOptions = {
        from: `"Sistema de Documentos" <${EMAIL_USER}>`,
        to,
        subject: 'Verifica tu cuenta - Sistema de Documentos',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #2563eb; margin: 0;">Sistema de Documentos</h1>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px;">
                    <h2 style="color: #1f2937; margin-top: 0;">¡Bienvenido!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                        Gracias por registrarte. Para activar tu cuenta y comenzar a usar el sistema, por favor confirma tu correo electrónico.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verificar mi cuenta</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                    </p>
                    <p style="background-color: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #374151;">
                        ${verificationLink}
                    </p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
                </div>
            </div>
        `
    };

    try {
        // Verificar conexión antes de enviar (opcional, ayuda a depurar)
        await transporter.verify();
        console.log('✅ Conexión SMTP verificada.');

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Correo enviado ID: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        throw error; // Lanzar para que el controlador detecte el fallo
    }
};

module.exports = {
    sendVerificationEmail
};
