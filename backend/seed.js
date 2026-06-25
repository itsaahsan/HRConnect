const bcrypt = require('bcryptjs');
const { sequelize, User, Employee, Department, Attendance, Leave, Payroll, LeaveBalance, Notification, Holiday, ActivityLog } = require('./models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // === DEPARTMENTS ===
    const departments = await Department.bulkCreate([
      { name: 'Engineering', code: 'ENG', description: 'Software development and technical operations', budget: 500000 },
      { name: 'Human Resources', code: 'HR', description: 'People management and organizational development', budget: 200000 },
      { name: 'Marketing', code: 'MKT', description: 'Brand management and customer acquisition', budget: 300000 },
      { name: 'Finance', code: 'FIN', description: 'Financial planning and accounting', budget: 250000 },
      { name: 'Operations', code: 'OPS', description: 'Business operations and logistics', budget: 350000 }
    ]);
    console.log('Departments created');

    // === USERS ===
    const hashedPassword = await bcrypt.hash('Admin1234', 12);
    const hashedManager = await bcrypt.hash('Manager1234', 12);
    const hashedEmployee = await bcrypt.hash('Employee1234', 12);

    const users = await User.bulkCreate([
      { email: 'admin@hrconnect.com', password: hashedPassword, role: 'admin', is_active: true },
      { email: 'manager@hrconnect.com', password: hashedManager, role: 'manager', is_active: true },
      { email: 'manager2@hrconnect.com', password: hashedManager, role: 'manager', is_active: true },
      { email: 'employee@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true },
      { email: 'sarah.chen@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true },
      { email: 'michael.brown@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true },
      { email: 'emily.davis@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true },
      { email: 'james.wilson@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true },
      { email: 'lisa.anderson@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true },
      { email: 'david.martinez@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true },
      { email: 'rachel.taylor@hrconnect.com', password: hashedEmployee, role: 'employee', is_active: true }
    ]);
    console.log('Users created');

    // === EMPLOYEES ===
    const employees = await Employee.bulkCreate([
      {
        user_id: users[0].id, employee_id: 'EMP001', first_name: 'Ahmad', last_name: 'Hassan',
        email: 'admin@hrconnect.com', phone: '+8801712345678', department_id: departments[1].id,
        position: 'HR Director', salary: 85000, join_date: '2020-01-15', status: 'active',
        emergency_contact: 'Fatima Hassan - +8801711111111', address: 'Banani, Dhaka'
      },
      {
        user_id: users[1].id, employee_id: 'EMP002', first_name: 'Karim', last_name: 'Ahmed',
        email: 'manager@hrconnect.com', phone: '+8801712345679', department_id: departments[0].id,
        position: 'Engineering Manager', salary: 75000, join_date: '2020-03-20', status: 'active',
        emergency_contact: 'Nusrat Ahmed - +8801722222222', address: 'Gulshan, Dhaka'
      },
      {
        user_id: users[2].id, employee_id: 'EMP003', first_name: 'Sabrina', last_name: 'Islam',
        email: 'manager2@hrconnect.com', phone: '+8801712345680', department_id: departments[2].id,
        position: 'Marketing Manager', salary: 70000, join_date: '2021-01-10', status: 'active',
        emergency_contact: 'Tanvir Islam - +8801733333333', address: 'Dhanmondi, Dhaka'
      },
      {
        user_id: users[3].id, employee_id: 'EMP004', first_name: 'Rafiq', last_name: 'Uddin',
        email: 'employee@hrconnect.com', phone: '+8801712345681', department_id: departments[0].id,
        position: 'Senior Developer', salary: 55000, join_date: '2021-06-15', status: 'active',
        emergency_contact: 'Amina Uddin - +8801744444444', address: 'Uttara, Dhaka'
      },
      {
        user_id: users[4].id, employee_id: 'EMP005', first_name: 'Sarah', last_name: 'Chen',
        email: 'sarah.chen@hrconnect.com', phone: '+8801712345682', department_id: departments[0].id,
        position: 'Frontend Developer', salary: 45000, join_date: '2022-02-01', status: 'active',
        emergency_contact: 'David Chen - +8801755555555', address: 'Mirpur, Dhaka'
      },
      {
        user_id: users[5].id, employee_id: 'EMP006', first_name: 'Michael', last_name: 'Brown',
        email: 'michael.brown@hrconnect.com', phone: '+8801712345683', department_id: departments[3].id,
        position: 'Financial Analyst', salary: 50000, join_date: '2021-09-10', status: 'active',
        emergency_contact: 'Emma Brown - +8801766666666', address: 'Motijheel, Dhaka'
      },
      {
        user_id: users[6].id, employee_id: 'EMP007', first_name: 'Emily', last_name: 'Davis',
        email: 'emily.davis@hrconnect.com', phone: '+8801712345684', department_id: departments[1].id,
        position: 'HR Specialist', salary: 42000, join_date: '2022-04-20', status: 'active',
        emergency_contact: 'John Davis - +8801777777777', address: 'Banani, Dhaka'
      },
      {
        user_id: users[7].id, employee_id: 'EMP008', first_name: 'James', last_name: 'Wilson',
        email: 'james.wilson@hrconnect.com', phone: '+8801712345685', department_id: departments[4].id,
        position: 'Operations Lead', salary: 48000, join_date: '2021-11-05', status: 'active',
        emergency_contact: 'Mary Wilson - +8801788888888', address: 'Mohammadpur, Dhaka'
      },
      {
        user_id: users[8].id, employee_id: 'EMP009', first_name: 'Lisa', last_name: 'Anderson',
        email: 'lisa.anderson@hrconnect.com', phone: '+8801712345686', department_id: departments[2].id,
        position: 'Content Strategist', salary: 40000, join_date: '2022-07-15', status: 'active',
        emergency_contact: 'Robert Anderson - +8801799999999', address: 'Tejgaon, Dhaka'
      },
      {
        user_id: users[9].id, employee_id: 'EMP010', first_name: 'David', last_name: 'Martinez',
        email: 'david.martinez@hrconnect.com', phone: '+8801712345687', department_id: departments[0].id,
        position: 'Backend Developer', salary: 48000, join_date: '2023-01-10', status: 'active',
        emergency_contact: 'Sofia Martinez - +8801700000000', address: 'Bashundhara, Dhaka'
      },
      {
        user_id: users[10].id, employee_id: 'EMP011', first_name: 'Rachel', last_name: 'Taylor',
        email: 'rachel.taylor@hrconnect.com', phone: '+8801712345688', department_id: departments[3].id,
        position: 'Accountant', salary: 38000, join_date: '2023-03-20', status: 'active',
        emergency_contact: 'Thomas Taylor - +8801701010101', address: 'Lalmatia, Dhaka'
      }
    ]);
    console.log('Employees created');

    // Update department managers
    await departments[0].update({ manager_id: employees[1].id }); // Engineering - Karim
    await departments[1].update({ manager_id: employees[0].id }); // HR - Ahmad
    await departments[2].update({ manager_id: employees[2].id }); // Marketing - Sabrina
    console.log('Department managers assigned');

    // === ATTENDANCE (30 days) ===
    const attendanceRecords = [];
    const today = new Date();

    for (let emp of employees) {
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

        const hour = 9 + Math.floor(Math.random() * 2);
        const minute = Math.floor(Math.random() * 60);
        const clockIn = new Date(date);
        clockIn.setHours(hour, minute, 0);

        let status = 'present';
        if (hour >= 10) status = 'late';

        const workHours = 7 + Math.floor(Math.random() * 2) + Math.random();
        const overtime = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;

        const clockOut = new Date(clockIn);
        clockOut.setHours(clockOut.getHours() + Math.floor(workHours));

        attendanceRecords.push({
          employee_id: emp.id,
          date: date.toISOString().split('T')[0],
          clock_in: clockIn,
          clock_out: clockOut,
          status,
          work_hours: parseFloat(workHours.toFixed(2)),
          overtime_hours: parseFloat(overtime.toFixed(2))
        });
      }
    }
    await Attendance.bulkCreate(attendanceRecords);
    console.log('Attendance records created');

    // === LEAVES ===
    const leaveRecords = [
      { employee_id: employees[3].id, type: 'Annual', start_date: '2026-06-10', end_date: '2026-06-12', total_days: 3, reason: 'Family vacation to Cox\'s Bazar for summer break', status: 'approved', approved_by: employees[0].id },
      { employee_id: employees[4].id, type: 'Sick', start_date: '2026-06-05', end_date: '2026-06-06', total_days: 2, reason: 'Feeling unwell with flu symptoms, need rest to recover', status: 'approved', approved_by: employees[0].id },
      { employee_id: employees[5].id, type: 'Annual', start_date: '2026-06-15', end_date: '2026-06-17', total_days: 3, reason: 'Personal work requiring outstation travel to Sylhet', status: 'pending' },
      { employee_id: employees[6].id, type: 'Emergency', start_date: '2026-06-08', end_date: '2026-06-08', total_days: 1, reason: 'Family emergency requiring immediate attention at home', status: 'approved', approved_by: employees[1].id },
      { employee_id: employees[7].id, type: 'Annual', start_date: '2026-06-20', end_date: '2026-06-22', total_days: 3, reason: 'Planned holiday with family to Bandarban trip', status: 'pending' },
      { employee_id: employees[8].id, type: 'Sick', start_date: '2026-06-01', end_date: '2026-06-03', total_days: 3, reason: 'Medical appointment and recovery from minor surgery procedure', status: 'approved', approved_by: employees[2].id },
      { employee_id: employees[9].id, type: 'Unpaid', start_date: '2026-06-25', end_date: '2026-06-27', total_days: 3, reason: 'Personal leave for important family function celebration', status: 'rejected', rejection_reason: 'Critical project deadline during this period' },
      { employee_id: employees[10].id, type: 'Annual', start_date: '2026-06-18', end_date: '2026-06-19', total_days: 2, reason: 'Need time off for personal commitments and appointments', status: 'pending' },
      { employee_id: employees[3].id, type: 'Sick', start_date: '2026-05-20', end_date: '2026-05-21', total_days: 2, reason: 'Doctor visit and medical checkup required for health', status: 'approved', approved_by: employees[0].id },
      { employee_id: employees[4].id, type: 'Annual', start_date: '2026-07-01', end_date: '2026-07-03', total_days: 3, reason: 'Summer vacation planned with friends to Saint Martin', status: 'pending' }
    ];
    await Leave.bulkCreate(leaveRecords);
    console.log('Leave records created');

    // === LEAVE BALANCES ===
    const currentYear = today.getFullYear();
    const leaveBalances = employees.map(emp => ({
      employee_id: emp.id,
      year: currentYear,
      annual_total: 20,
      annual_used: Math.floor(Math.random() * 8),
      annual_remaining: 20 - Math.floor(Math.random() * 8),
      sick_total: 10,
      sick_used: Math.floor(Math.random() * 4),
      sick_remaining: 10 - Math.floor(Math.random() * 4)
    }));
    await LeaveBalance.bulkCreate(leaveBalances);
    console.log('Leave balances created');

    // === PAYROLL (3 months) ===
    const payrollRecords = [];
    for (let emp of employees) {
      for (let m = 1; m <= 3; m++) {
        const month = today.getMonth() - m + 2 > 0 ? today.getMonth() - m + 2 : 12 + (today.getMonth() - m + 2);
        const year = m > today.getMonth() + 1 ? today.getFullYear() - 1 : today.getFullYear();

        const basic = parseFloat(emp.salary);
        const allowances = parseFloat((basic * 0.2).toFixed(2));
        const absentDays = Math.floor(Math.random() * 3);
        const dailyRate = basic / 25;
        const deductions = parseFloat((absentDays * dailyRate).toFixed(2));
        const overtimeHours = Math.floor(Math.random() * 20);
        const overtimePay = parseFloat((overtimeHours * (dailyRate / 8) * 1.5).toFixed(2));
        const net = parseFloat((basic + allowances - deductions + overtimePay).toFixed(2));

        payrollRecords.push({
          employee_id: emp.id,
          month,
          year,
          basic_salary: basic,
          allowances,
          deductions,
          overtime_pay: overtimePay,
          net_salary: net,
          working_days: 25,
          present_days: 25 - absentDays,
          absent_days: absentDays,
          status: m === 1 ? 'processed' : 'paid',
          payment_date: m === 1 ? null : new Date(year, month, 5)
        });
      }
    }
    await Payroll.bulkCreate(payrollRecords);
    console.log('Payroll records created');

    // === NOTIFICATIONS ===
    const notifications = [
      { user_id: users[0].id, title: 'New Leave Request', message: 'James Wilson has submitted an annual leave request for 3 days.', type: 'leave', is_read: false },
      { user_id: users[0].id, title: 'Leave Approved', message: 'Rafiq Uddin\'s annual leave has been approved.', type: 'leave', is_read: true },
      { user_id: users[0].id, title: 'Payroll Processed', message: 'Monthly payroll for June 2026 has been processed.', type: 'payroll', is_read: false },
      { user_id: users[3].id, title: 'Leave Approved', message: 'Your annual leave request for June 10-12 has been approved.', type: 'leave', is_read: true },
      { user_id: users[3].id, title: 'Welcome to HRConnect', message: 'Your account has been created. Welcome to the team!', type: 'system', is_read: true }
    ];
    await Notification.bulkCreate(notifications);
    console.log('Notifications created');

    // === HOLIDAYS ===
    const holidays = await Holiday.bulkCreate([
      { name: 'New Year', date: '2026-01-01', type: 'public', description: 'New Year Day' },
      { name: 'Bengali New Year', date: '2026-04-14', type: 'public', description: 'Pohela Boishakh' },
      { name: 'Independence Day', date: '2026-03-26', type: 'public', description: 'Bangladesh Independence Day' },
      { name: 'Eid ul-Fitr', date: '2026-03-31', type: 'public', description: 'Eid celebration' },
      { name: 'Eid ul-Adha', date: '2026-06-07', type: 'public', description: 'Eid celebration' },
      { name: 'Victory Day', date: '2026-12-16', type: 'public', description: 'Bangladesh Victory Day' },
      { name: 'Company Foundation Day', date: '2026-06-15', type: 'company', description: 'HRConnect founding anniversary' },
      { name: 'Optional Holiday', date: '2026-11-01', type: 'optional', description: 'Optional religious holiday' }
    ]);
    console.log('Holidays created');

    // === ACTIVITY LOGS ===
    const activityLogs = await ActivityLog.bulkCreate([
      { user_id: users[0].id, action: 'login', entity: 'auth', details: 'Admin logged in', ip_address: '127.0.0.1' },
      { user_id: users[1].id, action: 'login', entity: 'auth', details: 'Manager logged in', ip_address: '127.0.0.1' },
      { user_id: users[0].id, action: 'create', entity: 'employee', entity_id: 11, details: 'Created employee Rachel Taylor', ip_address: '127.0.0.1' },
      { user_id: users[0].id, action: 'approve', entity: 'leave', entity_id: 1, details: 'Approved annual leave for Rafiq Uddin', ip_address: '127.0.0.1' },
      { user_id: users[0].id, action: 'update', entity: 'payroll', details: 'Processed payroll for June 2026', ip_address: '127.0.0.1' }
    ]);
    console.log('Activity logs created');

    console.log('\n=== SEED COMPLETE ===');
    console.log('Login Credentials:');
    console.log('Admin:    admin@hrconnect.com / Admin1234');
    console.log('Manager:  manager@hrconnect.com / Manager1234');
    console.log('Employee: employee@hrconnect.com / Employee1234');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
