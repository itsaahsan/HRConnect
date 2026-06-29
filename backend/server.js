const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const { sequelize, User, Employee, Department } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (required for rate-limiter behind Render's reverse proxy)
app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.send('HRConnect Backend is running!');
});

// Health check FIRST
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// DB readiness
let dbReady = false;
app.get('/api/ready', (req, res) => {
  if (dbReady) return res.status(200).json({ ready: true });
  res.status(503).json({ ready: false, message: 'Database not ready' });
});

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend build in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
console.log('Frontend dist path:', frontendDist, 'exists:', fs.existsSync(frontendDist));
app.use(express.static(frontendDist));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/holidays', require('./routes/holidays'));
app.use('/api/activity-logs', require('./routes/activityLogs'));

// SPA fallback — serve index.html for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large' });
    return res.status(400).json({ message: err.message });
  }
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    message: isProduction && (err.status || 500) >= 500
      ? 'Internal server error'
      : err.message || 'Internal server error'
  });
});

// Seed demo users if database is empty
const seedDemoUsers = async () => {
  try {
    const userCount = await User.count();
    if (userCount > 0) return;

    console.log('No users found — seeding demo data...');
    const bcrypt = require('bcryptjs');

    const hashedAdmin = await bcrypt.hash('Admin1234', 12);
    const hashedManager = await bcrypt.hash('Manager1234', 12);
    const hashedEmployee = await bcrypt.hash('Employee1234', 12);

    const users = await User.bulkCreate([
      { email: 'admin@hrconnect.com', password: hashedAdmin, role: 'admin', is_active: true },
      { email: 'manager@hrconnect.com', password: hashedManager, role: 'manager', is_active: true },
      { email: 'employee@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true }
    ]);

    const departments = await Department.bulkCreate([
      { name: 'Engineering', code: 'ENG', description: 'Software development', budget: 500000 },
      { name: 'Human Resources', code: 'HR', description: 'People management', budget: 200000 }
    ]);

    await Employee.bulkCreate([
      {
        user_id: users[0].id, employee_id: 'EMP001', first_name: 'Ahmad', last_name: 'Hassan',
        email: 'admin@hrconnect.com', phone: '+8801712345678', department_id: departments[1].id,
        position: 'HR Director', salary: 85000, join_date: '2020-01-15', status: 'active'
      },
      {
        user_id: users[1].id, employee_id: 'EMP002', first_name: 'Karim', last_name: 'Ahmed',
        email: 'manager@hrconnect.com', phone: '+8801712345679', department_id: departments[0].id,
        position: 'Engineering Manager', salary: 75000, join_date: '2020-03-20', status: 'active'
      },
      {
        user_id: users[2].id, employee_id: 'EMP003', first_name: 'Rafiq', last_name: 'Uddin',
        email: 'employee@hrconnect.com', phone: '+8801712345681', department_id: departments[0].id,
        position: 'Senior Developer', salary: 55000, join_date: '2021-06-15', status: 'active'
      }
    ]);

    console.log('Demo users seeded successfully');
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

// Start
const startServer = async () => {
  const server = app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));

  const connectDB = async (retries = 10, delay = 5000) => {
    for (let i = 1; i <= retries; i++) {
      try {
        await sequelize.authenticate();
        console.log('Database connected');
        await sequelize.sync({ alter: true });
        console.log('Models synced');
        await seedDemoUsers();
        dbReady = true;
        return;
      } catch (error) {
        console.error(`Database connection attempt ${i}/${retries} failed:`, error.message);
        if (i < retries) await new Promise(r => setTimeout(r, delay));
      }
    }
    console.error('Could not connect to database after all retries. Exiting.');
    server.close(() => process.exit(1));
  };

  connectDB();
};

if (require.main === module) {
  startServer();
}

module.exports = app;
