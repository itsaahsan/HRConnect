const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leave = sequelize.define('Leave', {
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
  type: {
    type: DataTypes.ENUM('Annual', 'Sick', 'Unpaid', 'Emergency', 'Maternity', 'Paternity'),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'leaves',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Leave;
