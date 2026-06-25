const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('public', 'company', 'optional'),
    defaultValue: 'public'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'holidays',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Holiday;
