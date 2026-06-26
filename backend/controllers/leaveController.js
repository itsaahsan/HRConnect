const { Op } = require('sequelize');
const { Leave, Employee, Department, LeaveBalance, User, Notification } = require('../models');

exports.submitLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.userId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { type, start_date, end_date, reason } = req.body;

    if (!type || !start_date || !end_date || !reason) {
      return res.status(400).json({ message: 'Type, dates, and reason are required' });
    }

    if (reason.length < 20) {
      return res.status(400).json({ message: 'Reason must be at least 20 characters' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end < start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const currentYear = new Date().getFullYear();
    let leaveBalance = await LeaveBalance.findOne({
      where: { employee_id: employee.id, year: currentYear }
    });

    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        employee_id: employee.id,
        year: currentYear
      });
    }

    if (type === 'Annual') {
      if (leaveBalance.annual_remaining < totalDays) {
        return res.status(400).json({
          message: `Insufficient annual leave balance. Available: ${leaveBalance.annual_remaining} days`
        });
      }
    } else if (type === 'Sick') {
      if (leaveBalance.sick_remaining < totalDays) {
        return res.status(400).json({
          message: `Insufficient sick leave balance. Available: ${leaveBalance.sick_remaining} days`
        });
      }
    }

    const leave = await Leave.create({
      employee_id: employee.id,
      type,
      start_date,
      end_date,
      total_days: totalDays,
      reason,
      status: 'pending'
    });

    const department = await Department.findByPk(employee.department_id);
    if (department && department.manager_id) {
      const manager = await Employee.findByPk(department.manager_id);
      if (manager && manager.user_id) {
        await Notification.create({
          user_id: manager.user_id,
          title: 'New Leave Request',
          message: `${employee.first_name} ${employee.last_name} has submitted a ${type} leave request for ${totalDays} day(s).`,
          type: 'leave'
        });
      }
    }

    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    for (const admin of adminUsers) {
      await Notification.create({
        user_id: admin.id,
        title: 'New Leave Request',
        message: `${employee.first_name} ${employee.last_name} has submitted a ${type} leave request for ${totalDays} day(s).`,
        type: 'leave'
      });
    }

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Submit leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.userId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const leaves = await Leave.findAll({
      where: { employee_id: employee.id },
      include: [{
        model: Employee,
        as: 'approver',
        attributes: ['id', 'first_name', 'last_name']
      }],
      order: [['created_at', 'DESC']]
    });

    const currentYear = new Date().getFullYear();
    let leaveBalance = await LeaveBalance.findOne({
      where: { employee_id: employee.id, year: currentYear }
    });

    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        employee_id: employee.id,
        year: currentYear
      });
    }

    res.json({ leaves, leaveBalance });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.userId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const leave = await Leave.findOne({
      where: { id: req.params.id, employee_id: employee.id }
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
    }

    await leave.update({ status: 'cancelled' });

    res.json({ message: 'Leave cancelled successfully' });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      department_id,
      start_date,
      end_date
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (start_date && end_date) {
      where.start_date = { [Op.between]: [start_date, end_date] };
    }

    const employeeWhere = {};
    if (department_id) {
      employeeWhere.department_id = department_id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: leaves } = await Leave.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
        },
        {
          model: Employee,
          as: 'approver',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      leaves,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'first_name', 'last_name', 'user_id']
      }]
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leaves can be approved' });
    }

    const approver = await Employee.findOne({ where: { user_id: req.userId } });

    await leave.update({
      status: 'approved',
      approved_by: approver ? approver.id : null
    });

    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      where: { employee_id: leave.employee_id, year: currentYear }
    });

    if (leaveBalance) {
      if (leave.type === 'Annual') {
        if (leaveBalance.annual_remaining < leave.total_days) {
          return res.status(400).json({ message: 'Insufficient annual leave balance to approve' });
        }
        await leaveBalance.update({
          annual_used: leaveBalance.annual_used + leave.total_days,
          annual_remaining: leaveBalance.annual_remaining - leave.total_days
        });
      } else if (leave.type === 'Sick') {
        if (leaveBalance.sick_remaining < leave.total_days) {
          return res.status(400).json({ message: 'Insufficient sick leave balance to approve' });
        }
        await leaveBalance.update({
          sick_used: leaveBalance.sick_used + leave.total_days,
          sick_remaining: leaveBalance.sick_remaining - leave.total_days
        });
      }
    }

    if (leave.employee && leave.employee.user_id) {
      await Notification.create({
        user_id: leave.employee.user_id,
        title: 'Leave Approved',
        message: `Your ${leave.type} leave request for ${leave.total_days} day(s) has been approved.`,
        type: 'leave'
      });
    }

    res.json({ message: 'Leave approved successfully', leave });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const leave = await Leave.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'first_name', 'last_name', 'user_id']
      }]
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leaves can be rejected' });
    }

    const approver = await Employee.findOne({ where: { user_id: req.userId } });

    await leave.update({
      status: 'rejected',
      approved_by: approver ? approver.id : null,
      rejection_reason
    });

    if (leave.employee && leave.employee.user_id) {
      await Notification.create({
        user_id: leave.employee.user_id,
        title: 'Leave Rejected',
        message: `Your ${leave.type} leave request has been rejected. Reason: ${rejection_reason}`,
        type: 'leave'
      });
    }

    res.json({ message: 'Leave rejected successfully', leave });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaveBalances = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const currentYear = new Date().getFullYear();

    const where = { year: currentYear };
    if (employee_id) where.employee_id = employee_id;

    const balances = await LeaveBalance.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_id', 'first_name', 'last_name', 'department_id'],
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }]
    });

    res.json({ balances });
  } catch (error) {
    console.error('Get leave balances error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateLeaveBalance = async (req, res) => {
  try {
    const { employee_id, annual_total, sick_total } = req.body;
    const currentYear = new Date().getFullYear();

    let balance = await LeaveBalance.findOne({
      where: { employee_id, year: currentYear }
    });

    if (!balance) {
      balance = await LeaveBalance.create({
        employee_id,
        year: currentYear,
        annual_total: annual_total || 20,
        annual_remaining: annual_total || 20,
        sick_total: sick_total || 10,
        sick_remaining: sick_total || 10
      });
    } else {
      const updateData = {};
      if (annual_total !== undefined) {
        updateData.annual_total = annual_total;
        updateData.annual_remaining = annual_total - balance.annual_used;
      }
      if (sick_total !== undefined) {
        updateData.sick_total = sick_total;
        updateData.sick_remaining = sick_total - balance.sick_used;
      }
      await balance.update(updateData);
    }

    res.json({ message: 'Leave balance updated', balance });
  } catch (error) {
    console.error('Update leave balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaveCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const leaves = await Leave.findAll({
      where: {
        status: 'approved',
        [Op.or]: [
          { start_date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] } },
          { end_date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] } },
          {
            start_date: { [Op.lte]: startDate.toISOString().split('T')[0] },
            end_date: { [Op.gte]: endDate.toISOString().split('T')[0] }
          }
        ]
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_id', 'first_name', 'last_name'],
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
      }]
    });

    res.json({ leaves });
  } catch (error) {
    console.error('Leave calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
