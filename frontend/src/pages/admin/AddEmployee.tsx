import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import api from '../../api/axios';
import { employeeSchema } from '../../utils/validators';
import toast from 'react-hot-toast';

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(employeeSchema.extend({
      password: employeeSchema.shape.password.optional()
    }))
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/employees', {
        ...data,
        password: data.password || 'Employee1234'
      });
      toast.success('Employee created successfully');
      navigate('/admin/employees');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'job', label: 'Job Info' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/employees')} className="p-2 hover:bg-white/5 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">First Name *</label>
                <input {...register('first_name')} className="input-field" placeholder="Enter first name" />
                {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Last Name *</label>
                <input {...register('last_name')} className="input-field" placeholder="Enter last name" />
                {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                <input {...register('email')} type="email" className="input-field" placeholder="Enter email" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input {...register('phone')} className="input-field" placeholder="Enter phone number" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <textarea {...register('address')} className="input-field" rows={3} placeholder="Enter address" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Emergency Contact</label>
                <input {...register('emergency_contact')} className="input-field" placeholder="Name - Phone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input {...register('password')} type="password" className="input-field" placeholder="Default: Employee1234" />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
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
                <input {...register('position')} className="input-field" placeholder="Enter position" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Salary</label>
                <input {...register('salary', { valueAsNumber: true })} type="number" className="input-field" placeholder="Enter salary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Join Date</label>
                <input {...register('join_date')} type="date" className="input-field" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => navigate('/admin/employees')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
