import React, { useState, useEffect } from 'react';
import { Download, UserCheck, UserX, Clock } from 'lucide-react';
import api from '../../api/axios';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import { formatTime, formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const Attendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [todaySummary, setTodaySummary] = useState<any>(null);

  useEffect(() => {
    fetchDepartments();
    fetchTodaySummary();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [page, search, departmentFilter, statusFilter, dateFilter]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchTodaySummary = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodaySummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch today summary');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search,
        ...(departmentFilter && { department_id: departmentFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFilter && { date: dateFilter })
      });
      const response = await api.get(`/attendance?${params}`);
      setRecords(response.data.records);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      if (departmentFilter) params.append('department_id', departmentFilter);

      const response = await api.get(`/attendance/export/csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <button onClick={handleExportCSV} className="btn-secondary">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Present Today" value={todaySummary?.present || 0} icon={UserCheck} color="green" />
        <StatCard title="Absent Today" value={todaySummary?.absent || 0} icon={UserX} color="red" />
        <StatCard title="Late Today" value={todaySummary?.late || 0} icon={Clock} color="yellow" />
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." />
          </div>
          <FilterDropdown
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
            label="Department"
          />
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'present', label: 'Present' },
              { value: 'absent', label: 'Absent' },
              { value: 'late', label: 'Late' },
              { value: 'half-day', label: 'Half Day' }
            ]}
            label="Status"
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Clock In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Clock Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Hours</th>
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
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {record.employee?.first_name} {record.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{record.employee?.department?.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-sm text-white">{formatTime(record.clock_in)}</td>
                    <td className="px-4 py-3 text-sm text-white">{formatTime(record.clock_out)}</td>
                    <td className="px-4 py-3 text-sm text-white">{record.work_hours || 0}h</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        record.status === 'present' ? 'success' :
                        record.status === 'late' ? 'warning' :
                        record.status === 'half-day' ? 'info' : 'danger'
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

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default Attendance;
