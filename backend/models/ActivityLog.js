const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ActivityLog;
