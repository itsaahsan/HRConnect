const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const generatePayslip = (employee, payroll) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[payroll.month - 1];

  const payslip = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #1E293B; }
        .header { text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 15px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .payslip-title { font-size: 18px; margin-top: 10px; color: #64748B; }
        .period { font-size: 14px; color: #64748B; }
        .employee-info { background: #F1F5F9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .employee-info h3 { margin-top: 0; color: #3B82F6; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #E2E8F0; }
        th { background: #1E293B; color: white; font-size: 12px; text-transform: uppercase; }
        .total-row { font-weight: bold; background: #F1F5F9; }
        .net-salary { font-size: 20px; font-weight: bold; color: #10B981; text-align: right; padding: 15px; background: #F0FDF4; border-radius: 8px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">HRConnect</div>
        <div class="payslip-title">Employee Payslip</div>
        <div class="period">${monthName} ${payroll.year}</div>
      </div>

      <div class="employee-info">
        <h3>Employee Information</h3>
        <div class="info-grid">
          <div><strong>Employee ID:</strong> ${escapeHtml(employee.employee_id)}</div>
          <div><strong>Name:</strong> ${escapeHtml(employee.first_name)} ${escapeHtml(employee.last_name)}</div>
          <div><strong>Department:</strong> ${escapeHtml(employee.department ? employee.department.name : 'N/A')}</div>
          <div><strong>Position:</strong> ${escapeHtml(employee.position || 'N/A')}</div>
          <div><strong>Email:</strong> ${escapeHtml(employee.email)}</div>
          <div><strong>Join Date:</strong> ${escapeHtml(employee.join_date)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Earnings</th>
            <th>Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td>${Number(payroll.basic_salary).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Allowances</td>
            <td>${Number(payroll.allowances).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Overtime Pay</td>
            <td>${Number(payroll.overtime_pay).toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td>Total Earnings</td>
            <td>${(Number(payroll.basic_salary) + Number(payroll.allowances) + Number(payroll.overtime_pay)).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Deductions</th>
            <th>Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Deductions</td>
            <td>${Number(payroll.deductions).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="net-salary">
        Net Salary: ${Number(payroll.net_salary).toLocaleString()} BDT
      </div>

      <div class="footer">
        <p>This is a computer-generated payslip and does not require a signature.</p>
        <p>HRConnect - Connecting People, Powering Business</p>
      </div>
    </body>
    </html>
  `;

  return payslip;
};

module.exports = generatePayslip;
