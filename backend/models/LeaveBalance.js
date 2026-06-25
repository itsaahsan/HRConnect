const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  annual_total: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  annual_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  annual_remaining: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  sick_total: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  sick_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sick_remaining: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  tableName: 'leave_balances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LeaveBalance;
