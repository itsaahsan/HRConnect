import React, { useState, useEffect } from 'react';
import { Check, X, Filter } from 'lucide-react';
import api from '../../api/axios';
import FilterDropdown from '../../components/common/FilterDropdown';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [page, statusFilter, typeFilter, departmentFilter]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(departmentFilter && { department_id: departmentFilter })
      });
      const response = await api.get(`/leaves?${params}`);
      setLeaves(response.data.leaves);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      toast.success('Leave approved successfully');
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectionReason) return;
    try {
      await api.put(`/leaves/${rejectModal.id}/reject`, { rejection_reason: rejectionReason });
      toast.success('Leave rejected');
      setRejectModal(null);
      setRejectionReason('');
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Leave Management</h1>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            label="Status"
          />
          <FilterDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'Annual', label: 'Annual' },
              { value: 'Sick', label: 'Sick' },
              { value: 'Unpaid', label: 'Unpaid' },
              { value: 'Emergency', label: 'Emergency' }
            ]}
            label="Type"
          />
          <FilterDropdown
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
            label="Department"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reason</th>
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
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {leave.employee?.first_name} {leave.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{leave.employee?.department?.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{leave.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{leave.total_days}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">{leave.reason}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(leave.id)}
                            className="p-1.5 bg-green-500/10 hover:bg-green-500/10 rounded-lg"
                          >
                            <Check className="w-4 h-4 text-success" />
                          </button>
                          <button
                            onClick={() => setRejectModal(leave)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-100 rounded-lg"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Leave" size="sm">
        <div className="space-y-4">
          <p className="text-gray-400">
            Reject leave for <strong>{rejectModal?.employee?.first_name} {rejectModal?.employee?.last_name}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Rejection Reason *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Enter reason for rejection"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setRejectModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleReject} disabled={!rejectionReason} className="btn-danger">Reject</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leaves;
