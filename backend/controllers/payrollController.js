const { Op } = require('sequelize');
const { Payroll, Employee, Department, Attendance } = require('../models');
const generatePayslip = require('../utils/generatePayslip');
const { exportPayroll } = require('../utils/csvExport');

exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const existingPayroll = await Payroll.findOne({
      where: { month, year, status: { [Op.ne]: 'draft' } }
    });

    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll for this month has already been processed' });
    }

    await Payroll.destroy({
      where: { month, year, status: 'draft' }
    });

    const employees = await Employee.findAll({
      where: { status: 'active' },
      include: [{ model: Department, as: 'department' }]
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const workingDays = endDate.getDate();

    const payrollRecords = [];

    for (const employee of employees) {
      const attendance = await Attendance.findAll({
        where: {
          employee_id: employee.id,
          date: {
            [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
          }
        }
      });

      const presentDays = attendance.filter(a =>
        ['present', 'late'].includes(a.status)
      ).length;

      const absentDays = workingDays - presentDays;
      const totalOvertimeHours = attendance.reduce((sum, a) =>
        sum + parseFloat(a.overtime_hours || 0), 0
      );

      const basicSalary = parseFloat(employee.salary || 0);
      const dailyRate = basicSalary / workingDays;
      const allowances = parseFloat((basicSalary * 0.2).toFixed(2));
      const deductions = parseFloat((absentDays * dailyRate).toFixed(2));
      const overtimePay = parseFloat((totalOvertimeHours * (dailyRate / 8) * 1.5).toFixed(2));
      const netSalary = parseFloat((basicSalary + allowances - deductions + overtimePay).toFixed(2));

      const payroll = await Payroll.create({
        employee_id: employee.id,
        month,
        year,
        basic_salary: basicSalary,
        allowances,
        deductions,
        overtime_pay: overtimePay,
        net_salary: netSalary,
        working_days: workingDays,
        present_days: presentDays,
        absent_days: absentDays,
        status: 'draft'
      });

      payrollRecords.push(payroll);
    }

    res.status(201).json({
      message: `Payroll generated for ${employees.length} employees`,
      count: payrollRecords.length,
      records: payrollRecords
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayrollList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      month,
      year,
      status,
      employee_id,
      department_id,
      search = ''
    } = req.query;

    const where = {};

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (status) where.status = status;
    if (employee_id) where.employee_id = employee_id;

    const employeeWhere = {};
    if (department_id) employeeWhere.department_id = department_id;
    if (search) {
      employeeWhere[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { employee_id: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: records } = await Payroll.findAndCountAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }],
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalNet = records.reduce((sum, r) => sum + parseFloat(r.net_salary || 0), 0);

    res.json({
      records,
      totalNet,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get payroll list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }]
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json({ payroll });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const { basic_salary, allowances, deductions, overtime_pay } = req.body;

    const updateData = {};
    if (basic_salary !== undefined) updateData.basic_salary = basic_salary;
    if (allowances !== undefined) updateData.allowances = allowances;
    if (deductions !== undefined) updateData.deductions = deductions;
    if (overtime_pay !== undefined) updateData.overtime_pay = overtime_pay;

    if (Object.keys(updateData).length > 0) {
      const basic = parseFloat(updateData.basic_salary ?? payroll.basic_salary);
      const allow = parseFloat(updateData.allowances ?? payroll.allowances);
      const deduc = parseFloat(updateData.deductions ?? payroll.deductions);
      const overtime = parseFloat(updateData.overtime_pay ?? payroll.overtime_pay);
      updateData.net_salary = parseFloat((basic + allow - deduc + overtime).toFixed(2));
    }

    await payroll.update(updateData);

    res.json({ message: 'Payroll updated successfully', payroll });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Payroll IDs are required' });
    }

    await Payroll.update(
      { status: 'paid', payment_date: new Date() },
      { where: { id: { [Op.in]: ids } } }
    );

    res.json({ message: `${ids.length} payroll record(s) marked as paid` });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.processPayroll = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Payroll IDs are required' });
    }

    await Payroll.update(
      { status: 'processed' },
      { where: { id: { [Op.in]: ids }, status: 'draft' } }
    );

    res.json({ message: `${ids.length} payroll record(s) processed` });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyPayrolls = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.userId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const payrolls = await Payroll.findAll({
      where: { employee_id: employee.id },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({ payrolls });
  } catch (error) {
    console.error('Get my payrolls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generatePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }]
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const html = generatePayslip(payroll.employee, payroll);

    res.send(html);
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportPayrollCSV = async (req, res) => {
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
        attributes: ['employee_id', 'first_name', 'last_name']
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const csvData = records.map(r => ({
      employee_id: r.employee.employee_id,
      employee_name: `${r.employee.first_name} ${r.employee.last_name}`,
      month: monthNames[r.month - 1],
      year: r.year,
      basic_salary: r.basic_salary,
      allowances: r.allowances,
      deductions: r.deductions,
      overtime_pay: r.overtime_pay,
      net_salary: r.net_salary,
      status: r.status
    }));

    const filePath = await exportPayroll(csvData);

    res.download(filePath, 'payroll.csv', (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    console.error('Export payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
