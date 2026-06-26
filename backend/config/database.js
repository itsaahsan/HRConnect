const { Sequelize } = require('sequelize');
require('dotenv').config();

let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  dbUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, '');
  dbUrl = dbUrl.replace(/[?&]channel_binding=[^&]*/g, '');
  dbUrl = dbUrl.replace(/\?$/, '');
  dbUrl = dbUrl.replace(/&&/g, '&');
  dbUrl = dbUrl.replace(/&$/, '');
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
  }
});

module.exports = sequelize;
