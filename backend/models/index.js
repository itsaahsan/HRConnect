const sequelize = require('../config/database');
const User = require('./User');
const Employee = require('./Employee');
const Department = require('./Department');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Payroll = require('./Payroll');
const LeaveBalance = require('./LeaveBalance');
const Notification = require('./Notification');
const Holiday = require('./Holiday');
const ActivityLog = require('./ActivityLog');

// User <-> Employee
User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Employee <-> Department
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Department Manager
Department.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
Employee.hasOne(Department, { foreignKey: 'manager_id', as: 'managedDepartment' });

// Attendance <-> Employee
Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendanceRecords' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Leave <-> Employee
Employee.hasMany(Leave, { foreignKey: 'employee_id', as: 'leaves' });
Leave.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Leave approved_by
Leave.belongsTo(Employee, { foreignKey: 'approved_by', as: 'approver' });

// Payroll <-> Employee
Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payrolls' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// LeaveBalance <-> Employee
Employee.hasOne(LeaveBalance, { foreignKey: 'employee_id', as: 'leaveBalance' });
LeaveBalance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Notification <-> User
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ActivityLog <-> User
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Employee,
  Department,
  Attendance,
  Leave,
  Payroll,
  LeaveBalance,
  Notification,
  Holiday,
  ActivityLog
};
