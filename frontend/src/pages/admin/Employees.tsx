import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Eye, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../../api/axios';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [deleteModal, setDeleteModal] = useState<any>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, departmentFilter, statusFilter, sortBy, sortOrder]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...(departmentFilter && { department_id: departmentFilter }),
        ...(statusFilter && { status: statusFilter }),
        sortBy,
        sortOrder
      });
      const response = await api.get(`/employees?${params}`);
      setEmployees(response.data.employees);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/employees/${deleteModal.id}`);
      toast.success('Employee deleted successfully');
      setDeleteModal(null);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/employees/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Employees</h1>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn-secondary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => navigate('/admin/employees/new')} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or ID..." />
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
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'terminated', label: 'Terminated' }
            ]}
            label="Status"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
                <th onClick={() => handleSort('employee_id')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:bg-white/5">
                  <div className="flex items-center gap-1">ID <SortIcon field="employee_id" /></div>
                </th>
                <th onClick={() => handleSort('department_id')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:bg-white/5">
                  <div className="flex items-center gap-1">Department <SortIcon field="department_id" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Position</th>
                <th onClick={() => handleSort('salary')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:bg-white/5">
                  <div className="flex items-center gap-1">Salary <SortIcon field="salary" /></div>
                </th>
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
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${emp.first_name} ${emp.last_name}`} src={emp.profile_photo} />
                        <div>
                          <p className="text-sm font-medium text-white">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{emp.employee_id}</td>
                    <td className="px-4 py-3 text-sm text-white">{emp.department?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm text-white">{emp.position || '-'}</td>
                    <td className="px-4 py-3 text-sm text-white">{formatCurrency(emp.salary || 0)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.status === 'active' ? 'success' : emp.status === 'inactive' ? 'warning' : 'danger'}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="p-1.5 hover:bg-white/5 rounded-lg">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="p-1.5 hover:bg-white/5 rounded-lg">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setDeleteModal(emp)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Employee" size="sm">
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete <strong>{deleteModal?.first_name} {deleteModal?.last_name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
