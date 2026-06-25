import React, { useState, useEffect } from 'react';
import { Download, Play, CheckCircle, FileText, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import FilterDropdown from '../../components/common/FilterDropdown';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { getMonthName } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const Payroll: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchPayroll();
  }, [page, month, year, statusFilter]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        month: month.toString(),
        year: year.toString(),
        ...(statusFilter && { status: statusFilter })
      });
      const response = await api.get(`/payroll?${params}`);
      setRecords(response.data.records);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/payroll/generate', { month, year });
      toast.success('Payroll generated successfully');
      fetchPayroll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const handleProcess = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select records to process');
      return;
    }
    try {
      await api.put('/payroll/process/bulk', { ids: selectedIds });
      toast.success('Payroll processed');
      setSelectedIds([]);
      fetchPayroll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process');
    }
  };

  const handleMarkPaid = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select records to mark as paid');
      return;
    }
    try {
      await api.put('/payroll/paid/bulk', { ids: selectedIds });
      toast.success('Marked as paid');
      setSelectedIds([]);
      fetchPayroll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/payroll/export/csv?month=${month}&year=${year}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payroll.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1)
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - 2 + i).toString(),
    label: (new Date().getFullYear() - 2 + i).toString()
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Payroll</h1>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn-secondary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Generate Payroll
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <FilterDropdown value={month.toString()} onChange={(v) => setMonth(Number(v))} options={months} label="Month" />
          <FilterDropdown value={year.toString()} onChange={(v) => setYear(Number(v))} options={years} label="Year" />
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'processed', label: 'Processed' },
              { value: 'paid', label: 'Paid' }
            ]}
            label="Status"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex gap-3 mb-4">
            <button onClick={handleProcess} className="btn-secondary">
              <CheckCircle className="w-4 h-4" /> Process Selected ({selectedIds.length})
            </button>
            <button onClick={handleMarkPaid} className="btn-success">
              <CheckCircle className="w-4 h-4" /> Mark as Paid ({selectedIds.length})
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === records.length && records.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Basic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Allowances</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Net</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No payroll records found. Click "Generate Payroll" to create records.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => toggleSelect(record.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">
                        {record.employee?.first_name} {record.employee?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{record.employee?.employee_id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(record.basic_salary)}</td>
                    <td className="px-4 py-3 text-sm text-success">{formatCurrency(record.allowances)}</td>
                    <td className="px-4 py-3 text-sm text-red-400">{formatCurrency(record.deductions)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(record.net_salary)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={record.status === 'paid' ? 'success' : record.status === 'processed' ? 'info' : 'default'}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payroll/payslip/${record.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-white/5 rounded-lg inline-flex"
                      >
                        <FileText className="w-4 h-4 text-gray-400" />
                      </a>
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

export default Payroll;
