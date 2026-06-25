const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Employee, Department, ActivityLog } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRE) || 3600 }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRE) || 604800 }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated. Contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await user.update({ last_login: new Date() });

    await ActivityLog.create({ user_id: user.id, action: 'login', entity: 'auth', details: `${user.email} logged in`, ip_address: req.ip });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee ? {
          id: user.employee.id,
          employee_id: user.employee.employee_id,
          first_name: user.employee.first_name,
          last_name: user.employee.last_name,
          profile_photo: user.employee.profile_photo,
          department: user.employee.department ? user.employee.department.name : null
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, department_id, position, salary, join_date } = req.body;

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
      role: 'employee'
    });

    const lastEmployee = await Employee.findOne({
      order: [['id', 'DESC']]
    });
    const nextNumber = lastEmployee ? parseInt(lastEmployee.employee_id.replace('EMP', '')) + 1 : 1;
    const employeeId = `EMP${String(nextNumber).padStart(3, '0')}`;

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
      status: 'active'
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: {
          id: employee.id,
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          last_name: employee.last_name
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        employee: user.employee
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
