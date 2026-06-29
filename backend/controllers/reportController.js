const { Op } = require('sequelize');
const { Attendance, Leave, Payroll, Employee, Department } = require('../models');
const { exportAttendance, exportPayroll } = require('../utils/csvExport');
const sequelize = require('../config/database');

exports.getAttendanceReport = async (req, res) => {
  try {
    const { start_date, end_date, department_id } = req.query;

    const today = new Date();
    const start = start_date || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const end = end_date || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const where = {
      date: { [Op.between]: [start, end] }
    };

    const employeeWhere = {};
    if (department_id) employeeWhere.department_id = department_id;

    const records = await Attendance.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }],
      order: [['date', 'ASC']]
    });

    const summary = {
      total_records: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      half_day: records.filter(r => r.status === 'half-day').length,
      total_work_hours: records.reduce((sum, r) => sum + parseFloat(r.work_hours || 0), 0).toFixed(2),
      total_overtime: records.reduce((sum, r) => sum + parseFloat(r.overtime_hours || 0), 0).toFixed(2)
    };

    const byEmployee = {};
    records.forEach(r => {
      const empId = r.employee_id;
      if (!byEmployee[empId]) {
        byEmployee[empId] = {
          employee: {
            id: r.employee.id,
            employee_id: r.employee.employee_id,
            first_name: r.employee.first_name,
            last_name: r.employee.last_name,
            department: r.employee.department ? r.employee.department.name : 'Unassigned'
          },
          present: 0,
          absent: 0,
          late: 0,
          half_day: 0,
          total_hours: 0
        };
      }
      if (r.status === 'half-day') {
        byEmployee[empId].half_day++;
      } else if (byEmployee[empId][r.status] !== undefined) {
        byEmployee[empId][r.status]++;
      }
      byEmployee[empId].total_hours += parseFloat(r.work_hours || 0);
    });

    res.json({
      summary,
      byEmployee: Object.values(byEmployee),
      dateRange: { start_date: start, end_date: end }
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaveReport = async (req, res) => {
  try {
    const { start_date, end_date, department_id, status } = req.query;

    const where = {};
    if (status) where.status = status;
    if (start_date && end_date) {
      where.start_date = { [Op.between]: [start_date, end_date] };
    }

    const employeeWhere = {};
    if (department_id) employeeWhere.department_id = department_id;

    const leaves = await Leave.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }],
      order: [['start_date', 'DESC']]
    });

    const summary = {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      byType: {
        Annual: leaves.filter(l => l.type === 'Annual').length,
        Sick: leaves.filter(l => l.type === 'Sick').length,
        Unpaid: leaves.filter(l => l.type === 'Unpaid').length,
        Emergency: leaves.filter(l => l.type === 'Emergency').length,
        Maternity: leaves.filter(l => l.type === 'Maternity').length,
        Paternity: leaves.filter(l => l.type === 'Paternity').length
      }
    };

    const byDepartment = {};
    leaves.forEach(l => {
      const dept = l.employee.department ? l.employee.department.name : 'Unassigned';
      if (!byDepartment[dept]) {
        byDepartment[dept] = { total: 0, approved: 0, rejected: 0, pending: 0 };
      }
      byDepartment[dept].total++;
      byDepartment[dept][l.status]++;
    });

    res.json({
      summary,
      byDepartment,
      dateRange: start_date && end_date ? { start_date, end_date } : null
    });
  } catch (error) {
    console.error('Leave report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayrollReport = async (req, res) => {
  try {
    const { month, year, department_id } = req.query;

    const where = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const employeeWhere = {};
    if (department_id) employeeWhere.department_id = department_id;

    const records = await Payroll.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    const summary = {
      total_records: records.length,
      total_basic: records.reduce((sum, r) => sum + parseFloat(r.basic_salary || 0), 0).toFixed(2),
      total_allowances: records.reduce((sum, r) => sum + parseFloat(r.allowances || 0), 0).toFixed(2),
      total_deductions: records.reduce((sum, r) => sum + parseFloat(r.deductions || 0), 0).toFixed(2),
      total_overtime: records.reduce((sum, r) => sum + parseFloat(r.overtime_pay || 0), 0).toFixed(2),
      total_net: records.reduce((sum, r) => sum + parseFloat(r.net_salary || 0), 0).toFixed(2),
      paid: records.filter(r => r.status === 'paid').length,
      processed: records.filter(r => r.status === 'processed').length,
      draft: records.filter(r => r.status === 'draft').length
    };

    const byDepartment = {};
    records.forEach(r => {
      const dept = r.employee.department ? r.employee.department.name : 'Unassigned';
      if (!byDepartment[dept]) {
        byDepartment[dept] = { count: 0, total_net: 0 };
      }
      byDepartment[dept].count++;
      byDepartment[dept].total_net += parseFloat(r.net_salary || 0);
    });

    Object.keys(byDepartment).forEach(key => {
      byDepartment[key].total_net = byDepartment[key].total_net.toFixed(2);
    });

    res.json({
      summary,
      byDepartment
    });
  } catch (error) {
    console.error('Payroll report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHeadcountReport = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
    });

    const summary = {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      inactive: employees.filter(e => e.status === 'inactive').length,
      terminated: employees.filter(e => e.status === 'terminated').length
    };

    const byDepartment = {};
    employees.forEach(e => {
      const dept = e.department ? e.department.name : 'Unassigned';
      if (!byDepartment[dept]) {
        byDepartment[dept] = { total: 0, active: 0, inactive: 0, terminated: 0 };
      }
      byDepartment[dept].total++;
      byDepartment[dept][e.status]++;
    });

    const byPosition = {};
    employees.filter(e => e.status === 'active').forEach(e => {
      const pos = e.position || 'Unassigned';
      byPosition[pos] = (byPosition[pos] || 0) + 1;
    });

    res.json({
      summary,
      byDepartment,
      byPosition
    });
  } catch (error) {
    console.error('Headcount report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const totalEmployees = await Employee.count({ where: { status: 'active' } });

    const todayAttendance = await Attendance.findAll({ where: { date: today } });
    const presentToday = todayAttendance.filter(a => ['present', 'late'].includes(a.status)).length;

    const pendingLeaves = await Leave.count({ where: { status: 'pending' } });

    const monthlyPayroll = await Payroll.sum('net_salary', {
      where: { month: currentMonth, year: currentYear, status: { [Op.in]: ['processed', 'paid'] } }
    });

    const departments = await Department.findAll({
      include: [{
        model: Employee,
        as: 'employees',
        where: { status: 'active' },
        required: false,
        attributes: []
      }],
      attributes: ['id', 'name', [sequelize.fn('COUNT', sequelize.col('employees.id')), 'count']],
      group: ['Department.id', 'Department.name']
    });

    const recentLeaves = await Leave.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_id', 'first_name', 'last_name'],
        include: [{ model: Department, as: 'department', attributes: ['name'] }]
      }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    const recentEmployees = await Employee.findAll({
      where: { status: 'active' },
      include: [{ model: Department, as: 'department', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    const recentClockIns = await Attendance.findAll({
      where: { date: today, clock_in: { [Op.not]: null } },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_id', 'first_name', 'last_name'],
        include: [{ model: Department, as: 'department', attributes: ['name'] }]
      }],
      order: [['clock_in', 'DESC']],
      limit: 10
    });

    const monthlyAttendance = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [
            new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
            new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
          ]
        }
      },
      attributes: [
        'date',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'present'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")), 'late']
      ],
      group: ['date'],
      order: [['date', 'ASC']]
    });

    const leaveStats = await Leave.findAll({
      where: {
        created_at: {
          [Op.between]: [
            new Date(currentYear, currentMonth - 1, 1),
            new Date(currentYear, currentMonth, 0)
          ]
        }
      },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    res.json({
      stats: {
        totalEmployees,
        presentToday,
        pendingLeaves,
        monthlyPayrollCost: parseFloat(monthlyPayroll || 0)
      },
      departments,
      recentLeaves,
      recentEmployees,
      recentClockIns,
      monthlyAttendance,
      leaveStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
