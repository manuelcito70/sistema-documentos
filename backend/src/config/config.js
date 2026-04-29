require('dotenv').config();

if (!process.env.SECRET_KEY) {
    console.error("ERROR FATAL: La variable SECRET_KEY no está definida en el archivo .env.");
    process.exit(1);
}

module.exports = {
    SECRET_KEY: process.env.SECRET_KEY,
    BCRYPT_ROUNDS: 10
};
