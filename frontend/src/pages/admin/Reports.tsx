import React, { useState, useEffect } from 'react';
import { Download, Calendar, Users, Wallet, FileText } from 'lucide-react';
import api from '../../api/axios';
import FilterDropdown from '../../components/common/FilterDropdown';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('attendance');
  const [departments, setDepartments] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [activeReport, startDate, endDate, departmentFilter]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(departmentFilter && { department_id: departmentFilter })
      });
      const response = await api.get(`/reports/${activeReport}?${params}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leave', label: 'Leave', icon: FileText },
    { id: 'payroll', label: 'Payroll', icon: Wallet },
    { id: 'headcount', label: 'Headcount', icon: Users }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Reports</h1>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeReport === report.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <report.icon className="w-4 h-4" />
            {report.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
          <FilterDropdown
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
            label="Department"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {activeReport === 'attendance' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Present</p>
                    <p className="text-2xl font-bold text-success">{data.summary?.present || 0}</p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Absent</p>
                    <p className="text-2xl font-bold text-red-400">{data.summary?.absent || 0}</p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Late</p>
                    <p className="text-2xl font-bold text-warning">{data.summary?.late || 0}</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Total Hours</p>
                    <p className="text-2xl font-bold text-white">{data.summary?.total_work_hours || 0}</p>
                  </div>
                </div>
              </>
            )}

            {activeReport === 'leave' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{data.summary?.total || 0}</p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-warning">{data.summary?.pending || 0}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-success">{data.summary?.approved || 0}</p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-400">{data.summary?.rejected || 0}</p>
                  </div>
                </div>
              </>
            )}

            {activeReport === 'payroll' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Total Net</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(data.summary?.total_net || 0)}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Total Allowances</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(data.summary?.total_allowances || 0)}</p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(data.summary?.total_deductions || 0)}</p>
                  </div>
                </div>
              </>
            )}

            {activeReport === 'headcount' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{data.summary?.total || 0}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-success">{data.summary?.active || 0}</p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Inactive</p>
                    <p className="text-2xl font-bold text-warning">{data.summary?.inactive || 0}</p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Terminated</p>
                    <p className="text-2xl font-bold text-red-400">{data.summary?.terminated || 0}</p>
                  </div>
                </div>
              </>
            )}

            {data.byDepartment && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-white mb-4">By Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(data.byDepartment).map(([dept, stats]: [string, any]) => (
                    <div key={dept} className="p-4 bg-white/5 rounded-lg">
                      <p className="font-medium text-white">{dept}</p>
                      <div className="mt-2 text-sm text-gray-400">
                        {activeReport === 'payroll' ? (
                          <p>Total: {formatCurrency(stats.total_net || 0)}</p>
                        ) : (
                          <p>Count: {stats.total || stats.count || 0}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">Select parameters to view report</div>
        )}
      </div>
    </div>
  );
};

export default Reports;
