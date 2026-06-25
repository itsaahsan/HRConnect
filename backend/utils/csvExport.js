const csvWriter = require('csv-writer');
const path = require('path');

const createCSVWriter = (filename, headers) => {
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  const writer = csvWriter.createObjectCsvWriter({
    path: filePath,
    header: headers.map(h => ({ id: h.id, title: h.title }))
  });
  return { writer, filePath };
};

const exportEmployees = async (employees) => {
  const { writer, filePath } = createCSVWriter(
    `employees_${Date.now()}.csv`,
    [
      { id: 'employee_id', title: 'Employee ID' },
      { id: 'first_name', title: 'First Name' },
      { id: 'last_name', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'department', title: 'Department' },
      { id: 'position', title: 'Position' },
      { id: 'salary', title: 'Salary' },
      { id: 'join_date', title: 'Join Date' },
      { id: 'status', title: 'Status' }
    ]
  );
  await writer.writeRecords(employees);
  return filePath;
};

const exportAttendance = async (records) => {
  const { writer, filePath } = createCSVWriter(
    `attendance_${Date.now()}.csv`,
    [
      { id: 'employee_id', title: 'Employee ID' },
      { id: 'employee_name', title: 'Employee Name' },
      { id: 'date', title: 'Date' },
      { id: 'clock_in', title: 'Clock In' },
      { id: 'clock_out', title: 'Clock Out' },
      { id: 'work_hours', title: 'Work Hours' },
      { id: 'status', title: 'Status' }
    ]
  );
  await writer.writeRecords(records);
  return filePath;
};

const exportPayroll = async (records) => {
  const { writer, filePath } = createCSVWriter(
    `payroll_${Date.now()}.csv`,
    [
      { id: 'employee_id', title: 'Employee ID' },
      { id: 'employee_name', title: 'Employee Name' },
      { id: 'month', title: 'Month' },
      { id: 'year', title: 'Year' },
      { id: 'basic_salary', title: 'Basic Salary' },
      { id: 'allowances', title: 'Allowances' },
      { id: 'deductions', title: 'Deductions' },
      { id: 'overtime_pay', title: 'Overtime Pay' },
      { id: 'net_salary', title: 'Net Salary' },
      { id: 'status', title: 'Status' }
    ]
  );
  await writer.writeRecords(records);
  return filePath;
};

module.exports = { exportEmployees, exportAttendance, exportPayroll };
