const { Op } = require('sequelize');
const { Department, Employee, User } = require('../models');
const sequelize = require('../config/database');

exports.getAllDepartments = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const departments = await Department.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'employee_id', 'first_name', 'last_name', 'email'],
          required: false
        },
        {
          model: Employee,
          as: 'employees',
          attributes: ['id', 'status'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    const departmentsWithCount = departments.map(dept => {
      const deptJson = dept.toJSON();
      deptJson.employee_count = deptJson.employees ? deptJson.employees.filter(e => e.status === 'active').length : 0;
      delete deptJson.employees;
      return deptJson;
    });

    res.json({ departments: departmentsWithCount });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'employee_id', 'first_name', 'last_name', 'email', 'position']
        },
        {
          model: Employee,
          as: 'employees',
          include: [
            { model: User, as: 'user', attributes: ['id', 'is_active'] }
          ]
        }
      ]
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ department });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, manager_id, budget } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    const existingDept = await Department.findOne({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: name } },
          { code: { [Op.iLike]: code } }
        ]
      }
    });

    if (existingDept) {
      return res.status(400).json({ message: 'Department with this name or code already exists' });
    }

    if (manager_id) {
      const manager = await Employee.findByPk(manager_id);
      if (!manager) {
        return res.status(400).json({ message: 'Manager employee not found' });
      }

      const existingManaged = await Department.findOne({ where: { manager_id } });
      if (existingManaged) {
        return res.status(400).json({ message: 'This employee is already managing another department' });
      }
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || null,
      manager_id: manager_id || null,
      budget: budget || null
    });

    const fullDepartment = await Department.findByPk(department.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'employee_id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Department created successfully',
      department: fullDepartment
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const { name, code, description, manager_id, budget } = req.body;

    if (name || code) {
      const existingDept = await Department.findOne({
        where: {
          id: { [Op.ne]: req.params.id },
          [Op.or]: [
            name ? { name: { [Op.iLike]: name } } : {},
            code ? { code: { [Op.iLike]: code } } : {}
          ]
        }
      });

      if (existingDept) {
        return res.status(400).json({ message: 'Department with this name or code already exists' });
      }
    }

    if (manager_id) {
      const manager = await Employee.findByPk(manager_id);
      if (!manager) {
        return res.status(400).json({ message: 'Manager employee not found' });
      }

      const existingManaged = await Department.findOne({
        where: {
          manager_id,
          id: { [Op.ne]: req.params.id }
        }
      });
      if (existingManaged) {
        return res.status(400).json({ message: 'This employee is already managing another department' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (manager_id !== undefined) updateData.manager_id = manager_id;
    if (budget !== undefined) updateData.budget = budget;

    await department.update(updateData);

    const updatedDepartment = await Department.findByPk(department.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'employee_id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json({
      message: 'Department updated successfully',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employees',
        attributes: ['id']
      }]
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (department.employees && department.employees.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete department with assigned employees. Reassign them first.'
      });
    }

    await Department.destroy({ where: { id: req.params.id } });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartmentEmployees = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const employees = await Employee.findAll({
      where: { department_id: req.params.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'is_active', 'last_login'] }
      ],
      order: [['first_name', 'ASC']]
    });

    res.json({ employees });
  } catch (error) {
    console.error('Get department employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
