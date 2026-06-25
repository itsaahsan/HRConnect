const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (required for rate-limiter behind Render's reverse proxy)
app.set('trust proxy', 1);

// Health check FIRST
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({ origin: true, credentials: true }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large' });
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// DB readiness flag
let dbReady = false;

app.get('/api/ready', (req, res) => {
  if (dbReady) return res.status(200).json({ ready: true });
  res.status(503).json({ ready: false, message: 'Database not ready' });
});

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

startServer();
