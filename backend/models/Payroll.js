const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payroll = sequelize.define('Payroll', {
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
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  basic_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowances: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  overtime_pay: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  net_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  working_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  present_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  absent_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'processed', 'paid'),
    defaultValue: 'draft'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'payroll',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Payroll;
