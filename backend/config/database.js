const { Sequelize } = require('sequelize');
require('dotenv').config();

let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  dbUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');
}

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: isProduction ? false : console.log,
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
