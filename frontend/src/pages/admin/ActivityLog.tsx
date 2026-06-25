import React, { useState, useEffect } from 'react';
import { Activity, LogIn, Plus, Edit, Trash2, Check, X, Eye } from 'lucide-react';
import api from '../../api/axios';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatDate';

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchLogs(); }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/activity-logs?page=${page}&limit=20`);
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="w-4 h-4 text-blue-500" />;
      case 'create': return <Plus className="w-4 h-4 text-green-400" />;
      case 'update': return <Edit className="w-4 h-4 text-yellow-400" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-400" />;
      case 'approve': return <Check className="w-4 h-4 text-green-400" />;
      case 'reject': return <X className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'bg-blue-500/10 text-gray-300';
      case 'create': return 'bg-green-500/10 text-green-600';
      case 'update': return 'bg-yellow-500/10 text-yellow-600';
      case 'delete': return 'bg-red-500/10 text-red-600';
      case 'approve': return 'bg-green-500/10 text-green-600';
      case 'reject': return 'bg-red-500/10 text-red-600';
      default: return 'bg-white/5 text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-gray-300" />
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No activity recorded</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {log.user?.employee?.first_name} {log.user?.employee?.last_name}
                    <span className="font-normal text-gray-400"> {log.action} </span>
                    <span className="font-normal text-gray-300">{log.entity}</span>
                  </p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(log.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ActivityLog;
