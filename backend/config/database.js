const { Sequelize } = require('sequelize');
require('dotenv').config();

let dbUrl = process.env.DATABASE_URL;
// Clean up URL: remove channel_binding (Neon-specific, not supported by pg driver)
// and remove sslmode (handled by dialectOptions)
if (dbUrl) {
  dbUrl = dbUrl.replace(/[?&]channel_binding=[^&]*/g, '');
  dbUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, '');
  dbUrl = dbUrl.replace(/&&/g, '&');
  dbUrl = dbUrl.replace(/[?&]$/, '');
  dbUrl = dbUrl.replace(/\?&/, '?');
}

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: isProduction ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  retry: {
    max: 3
  }
});

module.exports = sequelize;
