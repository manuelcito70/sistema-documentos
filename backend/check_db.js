const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function checkColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const tableDescription = await sequelize.getQueryInterface().describeTable('Users');
        console.log('Users table columns:', Object.keys(tableDescription));

        const hasIsVerified = 'isVerified' in tableDescription;
        const hasVerificationToken = 'verificationToken' in tableDescription;

        console.log('Has isVerified:', hasIsVerified);
        console.log('Has verificationToken:', hasVerificationToken);

        if (!hasIsVerified || !hasVerificationToken) {
            console.log('Creating missing columns...');
            const queryInterface = sequelize.getQueryInterface();

            if (!hasIsVerified) {
                await queryInterface.addColumn('Users', 'isVerified', {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false
                });
                console.log('Added isVerified');
                // Set existing users to verified
                await sequelize.query('UPDATE "Users" SET "isVerified" = true');
            }

            if (!hasVerificationToken) {
                await queryInterface.addColumn('Users', 'verificationToken', {
                    type: DataTypes.STRING,
                    allowNull: true
                });
                console.log('Added verificationToken');
            }
            console.log('Migration completed automatically.');
        } else {
            console.log('Database is already up to date.');
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
