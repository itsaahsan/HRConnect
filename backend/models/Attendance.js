const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  clock_in: {
    type: DataTypes.DATE,
    allowNull: true
  },
  clock_out: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half-day', 'holiday'),
    defaultValue: 'present'
  },
  work_hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Attendance;
