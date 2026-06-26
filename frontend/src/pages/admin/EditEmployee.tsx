import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { employeeSchema } from '../../utils/validators';

const EditEmployee: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(employeeSchema.omit({ password: true }))
  });

  useEffect(() => {
    fetchEmployee();
    fetchDepartments();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      const emp = response.data.employee;
      reset({
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone || '',
        address: emp.address || '',
        emergency_contact: emp.emergency_contact || '',
        department_id: emp.department_id || '',
        position: emp.position || '',
        salary: emp.salary || '',
        join_date: emp.join_date || '',
        status: emp.status
      });
    } catch (error) {
      toast.error('Failed to load employee');
      navigate('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put(`/employees/${id}`, data);
      toast.success('Employee updated successfully');
      navigate('/admin/employees');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/employees')} className="p-2 hover:bg-white/5 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Employee</h1>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'personal' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'job' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Job Info
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                <input {...register('first_name')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                <input {...register('last_name')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input {...register('email')} type="email" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input {...register('phone')} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <textarea {...register('address')} className="input-field" rows={3} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Emergency Contact</label>
                <input {...register('emergency_contact')} className="input-field" />
              </div>
            </div>
          )}

          {activeTab === 'job' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                <select {...register('department_id', { valueAsNumber: true })} className="input-field">
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                <input {...register('position')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Salary</label>
                <input {...register('salary', { valueAsNumber: true })} type="number" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Join Date</label>
                <input {...register('join_date')} type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => navigate('/admin/employees')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
