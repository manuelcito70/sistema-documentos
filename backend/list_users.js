const { Sequelize, Op } = require('sequelize');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa.');

        const users = await User.findAll({
            attributes: ['id', 'username', 'nombre', 'cargo'],
        });

        console.log(`Encontrados ${users.length} usuarios:`);
        users.forEach(u => {
            console.log(`- [${u.id}] ${u.username} (${u.nombre}) - Cargo: ${u.cargo}`);
        });

        // Prueba de búsqueda simulada
        const query = 'Juan';
        console.log(`\nProbando búsqueda con query="${query}"...`);

        try {
            const results = await User.findAll({
                where: {
                    [Op.or]: [
                        { nombre: { [Op.iLike]: `%${query}%` } },
                        { cargo: { [Op.iLike]: `%${query}%` } },
                        { username: { [Op.iLike]: `%${query}%` } }
                    ]
                }
            });
            console.log(`Resultados de búsqueda: ${results.length}`);
        } catch (searchError) {
            console.error("Error en simulacion de búsqueda con iLike:", searchError.message);
            // Intentar con like normal para ver si es problema de operador
            console.log("Intentando con op.like...");
            const resultsLike = await User.findAll({
                where: {
                    [Op.or]: [
                        { nombre: { [Op.like]: `%${query}%` } },
                    ]
                }
            });
            console.log(`Resultados con Op.like: ${resultsLike.length}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

listUsers();
