import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Gift, Star } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editHoliday, setEditHoliday] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', date: '', type: 'public', description: '' });

  useEffect(() => { fetchHolidays(); }, []);

  const fetchHolidays = async () => {
    try {
      const response = await api.get('/holidays');
      setHolidays(response.data.holidays);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditHoliday(null); setFormData({ name: '', date: '', type: 'public', description: '' }); setShowModal(true); };
  const openEdit = (h: any) => { setEditHoliday(h); setFormData({ name: h.name, date: h.date, type: h.type, description: h.description || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editHoliday) { await api.put(`/holidays/${editHoliday.id}`, formData); toast.success('Updated'); }
      else { await api.post('/holidays', formData); toast.success('Created'); }
      setShowModal(false); fetchHolidays();
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this holiday?')) return;
    try { await api.delete(`/holidays/${id}`); toast.success('Deleted'); fetchHolidays(); }
    catch (error: any) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const upcoming = holidays.filter(h => new Date(h.date) >= new Date()).slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Holiday Calendar</h1>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Holiday</button>
      </div>

      {upcoming.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcoming.map((h, i) => (
            <div key={h.id} className={`card border-l-4 ${
              h.type === 'public' ? 'border-l-blue-500' : h.type === 'company' ? 'border-l-purple-500' : 'border-l-yellow-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {h.type === 'public' ? <Calendar className="w-4 h-4 text-blue-500" /> :
                 h.type === 'company' ? <Gift className="w-4 h-4 text-purple-400" /> :
                 <Star className="w-4 h-4 text-yellow-400" />}
                <Badge variant={h.type === 'public' ? 'info' : h.type === 'company' ? 'default' : 'warning'}>{h.type}</Badge>
              </div>
              <h3 className="font-bold text-white">{h.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{formatDate(h.date)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Date</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Type</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Description</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {holidays.map(h => (
              <tr key={h.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 text-sm font-semibold text-white">{h.name}</td>
                <td className="px-5 py-3 text-sm text-gray-400">{formatDate(h.date)}</td>
                <td className="px-5 py-3">
                  <Badge variant={h.type === 'public' ? 'info' : h.type === 'company' ? 'default' : 'warning'}>{h.type}</Badge>
                </td>
                <td className="px-5 py-3 text-sm text-gray-400">{h.description || '-'}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(h)} className="p-2 hover:bg-white/5 rounded-lg"><Edit className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => handleDelete(h.id)} className="p-2 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editHoliday ? 'Edit Holiday' : 'Add Holiday'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Name *</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Date *</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field">
              <option value="public">Public</option>
              <option value="company">Company</option>
              <option value="optional">Optional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editHoliday ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Holidays;
