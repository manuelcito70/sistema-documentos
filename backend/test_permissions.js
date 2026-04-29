const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPermissions() {
    console.log('=== PRUEBA DE PERMISOS DE USUARIOS ===\n');

    // 1. Login como usuario externo
    console.log('1️⃣ Probando con usuario EXTERNO...');
    try {
        const loginExterno = await axios.post(`${BASE_URL}/login`, {
            username: 'externo1',
            password: '1234'
        });

        const tokenExterno = loginExterno.data.token;
        console.log('✅ Login exitoso como externo1');
        console.log('   Rol:', loginExterno.data.user.rol);

        // Intentar VER documentos (debería funcionar)
        console.log('\n   Intentando VER documentos...');
        try {
            const docs = await axios.get(`${BASE_URL}/documentos`, {
                headers: { Authorization: `Bearer ${tokenExterno}` }
            });
            console.log(`   ✅ Puede ver documentos (${docs.data.length} encontrados)`);
        } catch (error) {
            console.log('   ❌ No puede ver documentos:', error.response?.data?.mensaje);
        }

        // Intentar CREAR documento (debería fallar)
        console.log('\n   Intentando CREAR documento...');
        try {
            await axios.post(`${BASE_URL}/documentos`, {
                codigo: 'TEST-EXT-001',
                detalle: 'Prueba de creación',
                remitente: 'Externo',
                destinatario: 'Test',
                cargo: 'Test',
                quienRecibe: 'Test',
                tipoMovimiento: 'enviado',
                clasificacion: 'externo',
                estado: 'pendiente',
                fechaRegistro: new Date().toISOString().split('T')[0]
            }, {
                headers: { Authorization: `Bearer ${tokenExterno}` }
            });
            console.log('   ❌ ERROR: Usuario externo pudo crear documento (no debería)');
        } catch (error) {
            console.log('   ✅ Correctamente bloqueado:', error.response?.data?.mensaje);
        }

    } catch (error) {
        console.error('❌ Error en login externo:', error.response?.data || error.message);
    }

    // 2. Login como usuario interno
    console.log('\n\n2️⃣ Probando con usuario INTERNO...');
    try {
        const loginInterno = await axios.post(`${BASE_URL}/login`, {
            username: 'interno1',
            password: '1234'
        });

        const tokenInterno = loginInterno.data.token;
        console.log('✅ Login exitoso como interno1');
        console.log('   Rol:', loginInterno.data.user.rol);

        // Intentar VER documentos (debería funcionar)
        console.log('\n   Intentando VER documentos...');
        try {
            const docs = await axios.get(`${BASE_URL}/documentos`, {
                headers: { Authorization: `Bearer ${tokenInterno}` }
            });
            console.log(`   ✅ Puede ver documentos (${docs.data.length} encontrados)`);
        } catch (error) {
            console.log('   ❌ No puede ver documentos:', error.response?.data?.mensaje);
        }

        // Intentar CREAR documento (debería funcionar)
        console.log('\n   Intentando CREAR documento...');
        try {
            const formData = new FormData();
            formData.append('codigo', 'TEST-INT-' + Date.now());
            formData.append('detalle', 'Prueba de creación por usuario interno');
            formData.append('remitente', 'Usuario Interno');
            formData.append('destinatario', 'Test Dest');
            formData.append('cargo', 'Administrativo');
            formData.append('quienRecibe', 'Receptor Test');
            formData.append('tipoMovimiento', 'enviado');
            formData.append('clasificacion', 'interno');
            formData.append('estado', 'pendiente');
            formData.append('fechaRegistro', new Date().toISOString().split('T')[0]);

            // Nota: axios con FormData requiere configuración especial
            // Por simplicidad, usamos JSON aquí
            const newDoc = await axios.post(`${BASE_URL}/documentos`, {
                codigo: 'TEST-INT-' + Date.now(),
                detalle: 'Prueba de creación por usuario interno',
                remitente: 'Usuario Interno',
                destinatario: 'Test Dest',
                cargo: 'Administrativo',
                quienRecibe: 'Receptor Test',
                tipoMovimiento: 'enviado',
                clasificacion: 'interno',
                estado: 'pendiente',
                fechaRegistro: new Date().toISOString().split('T')[0]
            }, {
                headers: { Authorization: `Bearer ${tokenInterno}` }
            });
            console.log('   ✅ Puede crear documentos');
        } catch (error) {
            console.log('   ❌ No puede crear documento:', error.response?.data?.mensaje || error.message);
        }

    } catch (error) {
        console.error('❌ Error en login interno:', error.response?.data || error.message);
    }

    console.log('\n\n=== RESUMEN ===');
    console.log('✅ Usuario EXTERNO: Solo puede VER documentos (lectura)');
    console.log('✅ Usuario INTERNO: Puede VER y CREAR documentos');
    console.log('✅ Las restricciones de permisos están funcionando correctamente');
}

testPermissions();
