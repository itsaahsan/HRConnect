import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { getMonthName } from '../../utils/formatDate';

const EmployeePayslips: React.FC = () => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll/my');
      setPayrolls(response.data.payrolls);
    } catch (error) {
      console.error('Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Payslips</h1>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Basic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Allowances</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Net Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No payslip records</td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm font-medium">
                      {getMonthName(payroll.month)} {payroll.year}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(payroll.basic_salary)}</td>
                    <td className="px-4 py-3 text-sm text-success">{formatCurrency(payroll.allowances)}</td>
                    <td className="px-4 py-3 text-sm text-red-400">{formatCurrency(payroll.deductions)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(payroll.net_salary)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={payroll.status === 'paid' ? 'success' : 'default'}>
                        {payroll.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payroll/payslip/${payroll.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs py-1 px-2"
                      >
                        <FileText className="w-3 h-3" /> View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslips;
