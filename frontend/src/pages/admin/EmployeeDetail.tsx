import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign } from 'lucide-react';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const EmployeeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      setEmployee(response.data.employee);
    } catch (error) {
      console.error('Failed to fetch employee');
      navigate('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/employees')} className="p-2 hover:bg-white/5 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Employee Details</h1>
        </div>
        <button onClick={() => navigate(`/admin/employees/${id}/edit`)} className="btn-primary">
          <Edit className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={`${employee.first_name} ${employee.last_name}`} src={employee.profile_photo} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">{employee.first_name} {employee.last_name}</h2>
              <Badge variant={employee.status === 'active' ? 'success' : employee.status === 'inactive' ? 'warning' : 'danger'}>
                {employee.status}
              </Badge>
            </div>
            <p className="text-gray-400 mb-4">{employee.employee_id} • {employee.position || 'No position'}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" /> {employee.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" /> {employee.phone || 'No phone'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Briefcase className="w-4 h-4" /> {employee.department?.name || 'Unassigned'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <DollarSign className="w-4 h-4" /> {formatCurrency(employee.salary || 0)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" /> Joined {formatDate(employee.join_date)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" /> {employee.address || 'No address'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Recent Attendance</h3>
          <div className="space-y-2">
            {(employee.attendanceRecords || []).slice(0, 7).map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="text-sm text-gray-400">{formatDate(record.date)}</span>
                <Badge variant={
                  record.status === 'present' ? 'success' :
                  record.status === 'late' ? 'warning' : 'danger'
                }>
                  {record.status}
                </Badge>
              </div>
            ))}
            {(!employee.attendanceRecords || employee.attendanceRecords.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No attendance records</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Recent Leaves</h3>
          <div className="space-y-2">
            {(employee.leaves || []).slice(0, 5).map((leave: any) => (
              <div key={leave.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-white">{leave.type}</span>
                  <span className="text-xs text-gray-400 ml-2">{leave.total_days} day(s)</span>
                </div>
                <Badge variant={
                  leave.status === 'approved' ? 'success' :
                  leave.status === 'rejected' ? 'danger' :
                  leave.status === 'pending' ? 'warning' : 'default'
                }>
                  {leave.status}
                </Badge>
              </div>
            ))}
            {(!employee.leaves || employee.leaves.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No leave records</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Recent Payroll</h3>
          <div className="space-y-2">
            {(employee.payrolls || []).slice(0, 5).map((payroll: any) => (
              <div key={payroll.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="text-sm text-gray-400">
                  {payroll.month}/{payroll.year}
                </span>
                <div className="text-right">
                  <span className="text-sm font-medium text-white">{formatCurrency(payroll.net_salary)}</span>
                  <Badge variant={payroll.status === 'paid' ? 'success' : 'default'}>{payroll.status}</Badge>
                </div>
              </div>
            ))}
            {(!employee.payrolls || employee.payrolls.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No payroll records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
