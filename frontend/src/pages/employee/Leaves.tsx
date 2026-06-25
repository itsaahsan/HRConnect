import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X as XIcon, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { leaveSchema } from '../../utils/validators';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const EmployeeLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(leaveSchema)
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leaves/my');
      setLeaves(response.data.leaves);
      setLeaveBalance(response.data.leaveBalance);
    } catch (error) {
      console.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await api.post('/leaves', data);
      toast.success('Leave request submitted');
      setShowModal(false);
      reset();
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.put(`/leaves/${id}/cancel`);
      toast.success('Leave cancelled');
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Leaves</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Request Leave
        </button>
      </div>

      {leaveBalance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Annual Leave</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{leaveBalance.annual_remaining}</span>
              <span className="text-sm text-gray-400 mb-1">/ {leaveBalance.annual_total} remaining</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/10 rounded-full"
                style={{ width: `${(leaveBalance.annual_used / leaveBalance.annual_total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Used: {leaveBalance.annual_used}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Sick Leave</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-success">{leaveBalance.sick_remaining}</span>
              <span className="text-sm text-gray-400 mb-1">/ {leaveBalance.sick_total} remaining</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${(leaveBalance.sick_used / leaveBalance.sick_total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Used: {leaveBalance.sick_used}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-base font-semibold text-white mb-4">Leave History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
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
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No leave records</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm font-medium">{leave.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </td>
                    <td className="px-4 py-3 text-sm">{leave.total_days}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">{leave.reason}</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        leave.status === 'approved' ? 'success' :
                        leave.status === 'rejected' ? 'danger' :
                        leave.status === 'cancelled' ? 'default' : 'warning'
                      }>
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(leave.id)}
                          className="text-sm text-red-400 hover:text-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Request Leave">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Leave Type *</label>
            <select {...register('type')} className="input-field">
              <option value="">Select type</option>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Emergency">Emergency</option>
              <option value="Maternity">Maternity</option>
              <option value="Paternity">Paternity</option>
            </select>
            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Date *</label>
              <input {...register('start_date')} type="date" className="input-field" />
              {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Date *</label>
              <input {...register('end_date')} type="date" className="input-field" />
              {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Reason * (min 20 characters)</label>
            <textarea {...register('reason')} className="input-field" rows={4} placeholder="Enter reason for leave..." />
            {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeLeaves;
