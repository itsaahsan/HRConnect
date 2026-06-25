const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Employee, User, Department, Attendance, Leave, Payroll } = require('../models');
const { exportEmployees } = require('../utils/csvExport');
const path = require('path');

exports.getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department_id,
      status,
      position,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employee_id: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (department_id) where.department_id = department_id;
    if (status) where.status = status;
    if (position) where.position = { [Op.iLike]: `%${position}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active'] }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      employees,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department' },
        { model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active', 'last_login'] },
        {
          model: Attendance,
          as: 'attendanceRecords',
          order: [['date', 'DESC']],
          limit: 30
        },
        {
          model: Leave,
          as: 'leaves',
          order: [['created_at', 'DESC']],
          limit: 10
        },
        {
          model: Payroll,
          as: 'payrolls',
          order: [['year', 'DESC'], ['month', 'DESC']],
          limit: 6
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const {
      email, password, first_name, last_name, phone,
      department_id, position, salary, join_date,
      emergency_contact, address, role = 'employee'
    } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'Email, password, first name, and last name are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      is_active: true
    });

    const lastEmployee = await Employee.findOne({
      order: [['id', 'DESC']]
    });
    const nextNumber = lastEmployee ? parseInt(lastEmployee.employee_id.replace('EMP', '')) + 1 : 1;
    const employeeId = `EMP${String(nextNumber).padStart(3, '0')}`;

    const profile_photo = req.file ? req.file.filename : null;

    const employee = await Employee.create({
      user_id: user.id,
      employee_id: employeeId,
      first_name,
      last_name,
      email,
      phone: phone || null,
      department_id: department_id || null,
      position: position || null,
      salary: salary || null,
      join_date: join_date || new Date(),
      profile_photo,
      status: 'active',
      emergency_contact: emergency_contact || null,
      address: address || null
    });

    const fullEmployee = await Employee.findByPk(employee.id, {
      include: [
        { model: Department, as: 'department' },
        { model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active'] }
      ]
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: fullEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const {
      first_name, last_name, phone, department_id,
      position, salary, status, emergency_contact, address
    } = req.body;

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (phone !== undefined) updateData.phone = phone;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (position !== undefined) updateData.position = position;
    if (salary !== undefined) updateData.salary = salary;
    if (status !== undefined) updateData.status = status;
    if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact;
    if (address !== undefined) updateData.address = address;

    if (req.file) {
      updateData.profile_photo = req.file.filename;
    }

    await employee.update(updateData);

    if (employee.user_id) {
      const user = await User.findByPk(employee.user_id);
      if (user) {
        const userUpdate = {};
        if (status === 'inactive' || status === 'terminated') {
          userUpdate.is_active = false;
        } else if (status === 'active') {
          userUpdate.is_active = true;
        }
        if (Object.keys(userUpdate).length > 0) {
          await user.update(userUpdate);
        }
      }
    }

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [
        { model: Department, as: 'department' },
        { model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active'] }
      ]
    });

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.user_id) {
      await User.destroy({ where: { id: employee.user_id } });
    }

    await Employee.destroy({ where: { id: req.params.id } });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportEmployeesCSV = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: Department, as: 'department', attributes: ['name'] }
      ],
      order: [['employee_id', 'ASC']]
    });

    const employeeData = employees.map(emp => ({
      employee_id: emp.employee_id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department ? emp.department.name : 'Unassigned',
      position: emp.position || '',
      salary: emp.salary || 0,
      join_date: emp.join_date,
      status: emp.status
    }));

    const filePath = await exportEmployees(employeeData);

    res.download(filePath, 'employees.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.count({ where: { status: 'active' } });
    const byDepartment = await Department.findAll({
      include: [{
        model: Employee,
        as: 'employees',
        where: { status: 'active' },
        required: false,
        attributes: []
      }],
      attributes: ['id', 'name', [require('sequelize').fn('COUNT', require('sequelize').col('employees.id')), 'count']],
      group: ['Department.id', 'Department.name']
    });

    res.json({
      totalEmployees,
      byDepartment
    });
  } catch (error) {
    console.error('Employee stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
