import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock } from 'lucide-react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import FilterDropdown from '../../components/common/FilterDropdown';
import { formatTime, formatDate, getMonthName } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const EmployeeAttendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance/my?month=${month}&year=${year}`);
      setRecords(response.data.records);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setClocking(true);
    try {
      await api.post('/attendance/clock-in');
      toast.success('Clocked in successfully');
      fetchAttendance();
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
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setClocking(false);
    }
  };

  const todayRecord = records.find((r) => {
    const today = new Date().toISOString().split('T')[0];
    return r.date === today;
  });

  const isClockedIn = todayRecord && todayRecord.clock_in && !todayRecord.clock_out;
  const isClockedOut = todayRecord && todayRecord.clock_out;

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1)
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - 2 + i).toString(),
    label: (new Date().getFullYear() - 2 + i).toString()
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Attendance</h1>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleClockIn} disabled={clocking || isClockedIn || isClockedOut} className="btn-primary disabled:opacity-50">
          <LogIn className="w-4 h-4" /> Clock In
        </button>
        <button onClick={handleClockOut} disabled={clocking || !isClockedIn} className="btn-danger disabled:opacity-50">
          <LogOut className="w-4 h-4" /> Clock Out
        </button>
      </div>

      {todayRecord && (
        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Today's Status</h3>
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
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Present" value={summary.present} icon={Clock} color="green" />
          <StatCard title="Absent" value={summary.absent} icon={Clock} color="red" />
          <StatCard title="Late" value={summary.late} icon={Clock} color="yellow" />
          <StatCard title="Total Hours" value={`${summary.total_work_hours}h`} icon={Clock} color="blue" />
        </div>
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <FilterDropdown value={month.toString()} onChange={(v) => setMonth(Number(v))} options={months} label="Month" />
          <FilterDropdown value={year.toString()} onChange={(v) => setYear(Number(v))} options={years} label="Year" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Clock In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Clock Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Overtime</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No records found</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-sm">{formatTime(record.clock_in)}</td>
                    <td className="px-4 py-3 text-sm">{formatTime(record.clock_out)}</td>
                    <td className="px-4 py-3 text-sm">{record.work_hours || 0}h</td>
                    <td className="px-4 py-3 text-sm">{record.overtime_hours || 0}h</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        record.status === 'present' ? 'success' :
                        record.status === 'late' ? 'warning' : 'danger'
                      }>
                        {record.status}
                      </Badge>
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

export default EmployeeAttendance;
