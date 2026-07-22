const app = require('../backend/server.js');
const { sequelize, User, Employee, Department } = require('../backend/models');

let initialized = false;

async function initDB() {
  if (initialized) return;
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('Models synced');

    const userCount = await User.count();
    if (userCount === 0) {
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
    }

    initialized = true;
  } catch (error) {
    console.error('DB init error:', error.message);
  }
}

initDB();

module.exports = app;
