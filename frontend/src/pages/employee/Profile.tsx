import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, MapPin, Briefcase, Lock, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/common/Avatar';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { passwordSchema } from '../../utils/validators';
import toast from 'react-hot-toast';

const EmployeeProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const { register: profileRegister, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm();
  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setEmployee(response.data.user.employee);
      resetProfile({
        phone: response.data.user.employee?.phone || '',
        address: response.data.user.employee?.address || '',
        emergency_contact: response.data.user.employee?.emergency_contact || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put(`/employees/${employee.id}`, data);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
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
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar
            name={`${employee?.first_name || ''} ${employee?.last_name || ''}`}
            src={employee?.profile_photo}
            size="lg"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{employee?.first_name} {employee?.last_name}</h2>
            <p className="text-gray-400">{employee?.employee_id} • {employee?.position || 'No position'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" /> {employee?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" /> {employee?.phone || 'No phone'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Briefcase className="w-4 h-4" /> {employee?.department?.name || 'Unassigned'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" /> {employee?.address || 'No address'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'password' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
              <input {...profileRegister('phone')} className="input-field" placeholder="Enter phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
              <textarea {...profileRegister('address')} className="input-field" rows={3} placeholder="Enter address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Emergency Contact</label>
              <input {...profileRegister('emergency_contact')} className="input-field" placeholder="Name - Phone" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card">
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
              <input {...passwordRegister('currentPassword', { required: 'Current password is required' })} type="password" className="input-field" />
              {passwordErrors.currentPassword && <p className="text-red-400 text-xs mt-1">{String(passwordErrors.currentPassword.message)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
              <input {...passwordRegister('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} type="password" className="input-field" />
              {passwordErrors.newPassword && <p className="text-red-400 text-xs mt-1">{String(passwordErrors.newPassword.message)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
              <input {...passwordRegister('confirmPassword', { required: 'Please confirm password' })} type="password" className="input-field" />
              {passwordErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{String(passwordErrors.confirmPassword.message)}</p>}
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
