require('dotenv').config();

const config = {
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    },
    secret: process.env.JWT_SECRET
};

console.log('Database Configuration:', config.db);  // Add this line

module.exports = config;