const { Op } = require('sequelize');
const { Attendance, Employee, Department } = require('../models');
const sequelize = require('../config/database');
const { exportAttendance } = require('../utils/csvExport');

exports.clockIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.userId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id: employee.id,
        date: today
      }
    });

    if (existingAttendance && existingAttendance.clock_in) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    const now = new Date();
    const hour = now.getHours();
    let status = 'present';
    if (hour >= 10) {
      status = 'late';
    }

    if (existingAttendance) {
      await existingAttendance.update({
        clock_in: now,
        status
      });
    } else {
      await Attendance.create({
        employee_id: employee.id,
        date: today,
        clock_in: now,
        status
      });
    }

    const attendance = await Attendance.findOne({
      where: { employee_id: employee.id, date: today }
    });

    res.json({
      message: 'Clocked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.userId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: { employee_id: employee.id, date: today }
    });

    if (!attendance || !attendance.clock_in) {
      return res.status(400).json({ message: 'No clock-in record found for today' });
    }

    if (attendance.clock_out) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    const now = new Date();
    const clockIn = new Date(attendance.clock_in);
    const diffMs = now - clockIn;
    const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    const overtimeHours = workHours > 8 ? parseFloat((workHours - 8).toFixed(2)) : 0;

    await attendance.update({
      clock_out: now,
      work_hours: workHours,
      overtime_hours: overtimeHours
    });

    res.json({
      message: 'Clocked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.userId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { month, year } = req.query;

    const where = { employee_id: employee.id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      };
    }

    const records = await Attendance.findAll({
      where,
      order: [['date', 'DESC']]
    });

    const summary = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      half_day: records.filter(r => r.status === 'half-day').length,
      holiday: records.filter(r => r.status === 'holiday').length,
      total_work_hours: records.reduce((sum, r) => sum + parseFloat(r.work_hours || 0), 0).toFixed(2)
    };

    res.json({ records, summary });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      date,
      start_date,
      end_date,
      employee_id,
      department_id,
      status,
      search = ''
    } = req.query;

    const where = {};

    if (date) {
      where.date = date;
    } else if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (status) {
      where.status = status;
    }

    const employeeWhere = {};
    if (department_id) {
      employeeWhere.department_id = department_id;
    }
    if (search) {
      employeeWhere[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { employee_id: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: records } = await Attendance.findAndCountAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }],
      order: [['date', 'DESC'], ['clock_in', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      records,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { employee_id, date, status, note } = req.body;

    if (!employee_id || !date || !status) {
      return res.status(400).json({ message: 'Employee ID, date, and status are required' });
    }

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const existing = await Attendance.findOne({
      where: { employee_id, date }
    });

    if (existing) {
      await existing.update({ status, note: note || existing.note });
      return res.json({ message: 'Attendance updated', attendance: existing });
    }

    const attendance = await Attendance.create({
      employee_id,
      date,
      status,
      note: note || null
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTodaySummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const records = await Attendance.findAll({
      where: { date: today },
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }]
    });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      half_day: records.filter(r => r.status === 'half-day').length
    };

    res.json({ summary, records });
  } catch (error) {
    console.error('Today summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year, employee_id } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const where = {
      date: {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      }
    };

    if (employee_id) {
      where.employee_id = employee_id;
    }

    const records = await Attendance.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_id', 'first_name', 'last_name'],
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }],
      order: [['date', 'ASC']]
    });

    const employeeReports = {};
    records.forEach(record => {
      const empId = record.employee_id;
      if (!employeeReports[empId]) {
        employeeReports[empId] = {
          employee: record.employee,
          present: 0,
          absent: 0,
          late: 0,
          half_day: 0,
          total_hours: 0
        };
      }
      employeeReports[empId][record.status === 'half-day' ? 'half_day' : record.status] =
        (employeeReports[empId][record.status === 'half-day' ? 'half_day' : record.status] || 0) + 1;
      employeeReports[empId].total_hours += parseFloat(record.work_hours || 0);
    });

    res.json({
      month: parseInt(month),
      year: parseInt(year),
      report: Object.values(employeeReports)
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportAttendanceCSV = async (req, res) => {
  try {
    const { start_date, end_date, department_id, employee_id } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }
    if (employee_id) where.employee_id = employee_id;

    const employeeWhere = {};
    if (department_id) employeeWhere.department_id = department_id;

    const records = await Attendance.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        attributes: ['employee_id', 'first_name', 'last_name']
      }],
      order: [['date', 'DESC']]
    });

    const csvData = records.map(r => ({
      employee_id: r.employee.employee_id,
      employee_name: `${r.employee.first_name} ${r.employee.last_name}`,
      date: r.date,
      clock_in: r.clock_in || '',
      clock_out: r.clock_out || '',
      work_hours: r.work_hours,
      status: r.status
    }));

    const filePath = await exportAttendance(csvData);

    res.download(filePath, 'attendance.csv', (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
