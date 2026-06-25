import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import api from '../../api/axios';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', manager_id: '', budget: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/departments?search=${search}`);
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const openCreateModal = () => {
    setEditDept(null);
    setFormData({ name: '', code: '', description: '', manager_id: '', budget: '' });
    fetchEmployees();
    setShowModal(true);
  };

  const openEditModal = (dept: any) => {
    setEditDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      manager_id: dept.manager_id || '',
      budget: dept.budget || ''
    });
    fetchEmployees();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        manager_id: formData.manager_id ? Number(formData.manager_id) : null,
        budget: formData.budget ? Number(formData.budget) : null
      };

      if (editDept) {
        await api.put(`/departments/${editDept.id}`, data);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', data);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/departments/${deleteModal.id}`);
      toast.success('Department deleted successfully');
      setDeleteModal(null);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Departments</h1>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="card">
        <div className="mb-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search departments..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : departments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              No departments found
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{dept.name}</h3>
                    <p className="text-xs text-gray-400">{dept.code}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(dept)} className="p-1.5 hover:bg-white/5 rounded-lg">
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => setDeleteModal(dept)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                {dept.description && (
                  <p className="text-sm text-gray-400 mb-3">{dept.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{dept.employee_count || 0} employees</span>
                  </div>
                  {dept.budget && (
                    <span className="text-gray-400">{formatCurrency(dept.budget)}</span>
                  )}
                </div>
                {dept.manager && (
                  <p className="text-xs text-gray-400 mt-2">
                    Manager: {dept.manager.first_name} {dept.manager.last_name}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editDept ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Department name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Code *</label>
            <input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="input-field"
              placeholder="e.g. ENG"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Department description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Manager</label>
            <select
              value={formData.manager_id}
              onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              className="input-field"
            >
              <option value="">Select Manager</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Budget</label>
            <input
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              type="number"
              className="input-field"
              placeholder="Annual budget"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editDept ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Department" size="sm">
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete <strong>{deleteModal?.name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;
