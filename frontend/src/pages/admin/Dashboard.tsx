import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, Wallet, Plus, FileText, Building2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import EmployeeBarChart from '../../components/charts/EmployeeBarChart';
import AttendanceLineChart from '../../components/charts/AttendanceLineChart';
import LeavePieChart from '../../components/charts/LeavePieChart';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';

interface DashboardData {
  stats: { totalEmployees: number; presentToday: number; pendingLeaves: number; monthlyPayrollCost: number; };
  departments: { id: number; name: string; count: number }[];
  recentLeaves: any[];
  recentEmployees: any[];
  recentClockIns: any[];
  monthlyAttendance: any[];
  leaveStats: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setData(response.data);
    } catch (error) { console.error('Failed'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here's your overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Employees" value={data?.stats.totalEmployees || 0} icon={Users} color="blue" />
        <StatCard title="Present Today" value={data?.stats.presentToday || 0} icon={UserCheck} color="green" />
        <StatCard title="Pending Leaves" value={data?.stats.pendingLeaves || 0} icon={Clock} color="yellow" />
        <StatCard title="Monthly Payroll" value={formatCurrency(data?.stats.monthlyPayrollCost || 0)} icon={Wallet} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <EmployeeBarChart data={(data?.departments || []).map(d => ({ name: d.name, count: parseInt(d.count as any) || 0 }))} />
        <AttendanceLineChart data={(data?.monthlyAttendance || []).map((a: any) => ({
          date: new Date(a.date).toLocaleDateString('en-US', { day: 'numeric' }),
          present: parseInt(a.present) || 0, late: parseInt(a.late) || 0
        }))} />
        <LeavePieChart data={(data?.leaveStats || []).map((l: any) => ({ name: l.type, value: parseInt(l.count) || 0 }))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white">Recent Leave Requests</h3>
            <button onClick={() => navigate('/admin/leaves')}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(data?.recentLeaves || []).slice(0, 5).map((leave: any) => (
              <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    {leave.employee?.first_name?.[0]}{leave.employee?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{leave.employee?.first_name} {leave.employee?.last_name}</p>
                    <p className="text-xs text-white/40">{leave.type} · {leave.total_days} day(s)</p>
                  </div>
                </div>
                <Badge variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}>
                  {leave.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white">Today's Clock Ins</h3>
            <button onClick={() => navigate('/admin/attendance')}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(data?.recentClockIns || []).slice(0, 5).map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                    {record.employee?.first_name?.[0]}{record.employee?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{record.employee?.first_name} {record.employee?.last_name}</p>
                    <p className="text-xs text-gray-400">{record.employee?.department?.name}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{formatTime(record.clock_in)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/admin/employees/new')} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
        <button onClick={() => navigate('/admin/payroll')} className="btn-secondary">
          <Wallet className="w-4 h-4" /> Process Payroll
        </button>
        <button onClick={() => navigate('/admin/reports')} className="btn-secondary">
          <FileText className="w-4 h-4" /> View Reports
        </button>
        <button onClick={() => navigate('/admin/departments')} className="btn-secondary">
          <Building2 className="w-4 h-4" /> Departments
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
