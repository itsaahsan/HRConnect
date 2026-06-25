import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

interface Notification { id: number; title: string; message: string; type: string; is_read: boolean; created_at: string; }
interface NavbarProps { onMenuClick: () => void; }

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchNotifications(); const i = setInterval(fetchNotifications, 60000); return () => clearInterval(i); }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowNotifications(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchNotifications = async () => {
    try { const r = await api.get('/notifications'); setNotifications(r.data.notifications.slice(0, 10)); setUnreadCount(r.data.unreadCount); } catch {}
  };
  const markAsRead = async (id: number) => {
    try { await api.put(`/notifications/${id}/read`); setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x)); setUnreadCount(p => Math.max(0, p - 1)); } catch {}
  };
  const markAllAsRead = async () => {
    try { await api.put('/notifications/read-all'); setNotifications(n => n.map(x => ({ ...x, is_read: true }))); setUnreadCount(0); } catch {}
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: 'rgba(15,23,42,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Menu className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden" style={{ background: '#1E293B', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b transition-colors cursor-pointer hover:bg-white/5 ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }} onClick={() => markAsRead(n.id)}>
                      <p className="text-sm text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
              <img src="/change-management.png" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.employee?.first_name} {user?.employee?.last_name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
