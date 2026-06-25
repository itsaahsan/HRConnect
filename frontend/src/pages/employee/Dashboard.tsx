import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, Wallet, LogIn, LogOut, FileText, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const EmployeeDashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<any>(null);
  const [leaves, setLeaves] = useState<any>(null);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, leavesRes, payrollRes] = await Promise.all([
        api.get('/attendance/my'),
        api.get('/leaves/my'),
        api.get('/payroll/my')
      ]);
      setAttendance(attendanceRes.data);
      setLeaves(leavesRes.data);
      setPayrolls(payrollRes.data.payrolls);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setClocking(true);
    try {
      await api.post('/attendance/clock-in');
      toast.success('Clocked in successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      await api.post('/attendance/clock-out');
      toast.success('Clocked out successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setClocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const todayRecord = attendance?.records?.find((r: any) => {
    const today = new Date().toISOString().split('T')[0];
    return r.date === today;
  });

  const isClockedIn = todayRecord && todayRecord.clock_in && !todayRecord.clock_out;
  const isClockedOut = todayRecord && todayRecord.clock_out;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clock In" value={todayRecord ? formatTime(todayRecord.clock_in) : '--:--'} icon={LogIn} color="green" />
        <StatCard title="Clock Out" value={todayRecord ? formatTime(todayRecord.clock_out) : '--:--'} icon={LogOut} color="red" />
        <StatCard title="Work Hours" value={`${todayRecord?.work_hours || 0}h`} icon={Clock} color="blue" />
        <StatCard title="Leave Balance" value={`${leaves?.leaveBalance?.annual_remaining || 0} days`} icon={Calendar} color="yellow" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleClockIn}
          disabled={clocking || isClockedIn || isClockedOut}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn className="w-4 h-4" /> Clock In
        </button>
        <button
          onClick={handleClockOut}
          disabled={clocking || !isClockedIn}
          className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" /> Clock Out
        </button>
        <button onClick={() => navigate('/employee/leaves')} className="btn-secondary">
          <ClipboardList className="w-4 h-4" /> Request Leave
        </button>
        <button onClick={() => navigate('/employee/payslips')} className="btn-secondary">
          <FileText className="w-4 h-4" /> View Payslips
        </button>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-white mb-4">Today's Status</h3>
        {todayRecord ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">Status</p>
              <Badge variant={todayRecord.status === 'present' ? 'success' : todayRecord.status === 'late' ? 'warning' : 'danger'}>
                {todayRecord.status}
              </Badge>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">Clock In</p>
              <p className="text-sm font-medium">{formatTime(todayRecord.clock_in)}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">Clock Out</p>
              <p className="text-sm font-medium">{formatTime(todayRecord.clock_out)}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">Work Hours</p>
              <p className="text-sm font-medium">{todayRecord.work_hours || 0}h</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No attendance record for today. Click "Clock In" to start.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Leaves</h3>
            <button onClick={() => navigate('/employee/leaves')} className="text-sm text-white hover:text-white-hover">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {(leaves?.leaves || []).slice(0, 5).map((leave: any) => (
              <div key={leave.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div>
                  <span className="text-sm font-medium">{leave.type}</span>
                  <span className="text-xs text-gray-400 ml-2">{leave.total_days}d</span>
                </div>
                <Badge variant={
                  leave.status === 'approved' ? 'success' :
                  leave.status === 'rejected' ? 'danger' : 'warning'
                }>
                  {leave.status}
                </Badge>
              </div>
            ))}
            {(!leaves?.leaves || leaves.leaves.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No leave records</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Payslips</h3>
            <button onClick={() => navigate('/employee/payslips')} className="text-sm text-white hover:text-white-hover">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {payrolls.slice(0, 5).map((payroll) => (
              <div key={payroll.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="text-sm text-gray-400">
                  {payroll.month}/{payroll.year}
                </span>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatCurrency(payroll.net_salary)}</span>
                  <Badge variant={payroll.status === 'paid' ? 'success' : 'default'}>{payroll.status}</Badge>
                </div>
              </div>
            ))}
            {payrolls.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No payslip records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
