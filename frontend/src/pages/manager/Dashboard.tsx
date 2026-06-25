import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, Calendar, Check, X } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const ManagerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      toast.success('Leave approved');
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Team Members" value={data?.stats.totalEmployees || 0} icon={Users} color="blue" />
        <StatCard title="Present Today" value={data?.stats.presentToday || 0} icon={UserCheck} color="green" />
        <StatCard title="Pending Leaves" value={data?.stats.pendingLeaves || 0} icon={Clock} color="yellow" />
        <StatCard title="This Month" value={data?.stats.totalEmployees || 0} icon={Calendar} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Pending Leave Requests</h3>
            <button onClick={() => navigate('/manager/leaves')} className="text-sm text-white hover:text-white-hover">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(data?.recentLeaves || []).filter((l: any) => l.status === 'pending').slice(0, 5).map((leave: any) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">
                    {leave.employee?.first_name} {leave.employee?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">{leave.type} • {leave.total_days} day(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleApprove(leave.id)} className="p-1.5 bg-green-500/10 hover:bg-green-500/10 rounded-lg">
                    <Check className="w-4 h-4 text-success" />
                  </button>
                  <button onClick={() => navigate('/manager/leaves')} className="p-1.5 bg-red-500/10 hover:bg-red-100 rounded-lg">
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            {(!data?.recentLeaves || data.recentLeaves.filter((l: any) => l.status === 'pending').length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Today's Attendance</h3>
            <button onClick={() => navigate('/manager/attendance')} className="text-sm text-white hover:text-white-hover">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(data?.recentClockIns || []).slice(0, 5).map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">
                    {record.employee?.first_name} {record.employee?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">{record.employee?.department?.name}</p>
                </div>
                <Badge variant={record.status === 'late' ? 'warning' : 'success'}>
                  {record.clock_in ? new Date(record.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </Badge>
              </div>
            ))}
            {(!data?.recentClockIns || data.recentClockIns.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No clock ins today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
