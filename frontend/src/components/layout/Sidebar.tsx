import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Calendar, ClipboardList,
  Wallet, FileText, Settings, User, ChevronDown, ChevronUp,
  LogOut, X, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [hrMenuOpen, setHrMenuOpen] = useState(true);
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);

  const role = user?.role;
  const baseRoute = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/employee';

  const navItems = [
    { label: 'Dashboard', path: `${baseRoute}/dashboard`, icon: LayoutDashboard }
  ];

  const hrItems = [
    { label: 'Employees', path: `${baseRoute}/employees`, icon: Users, roles: ['admin'] },
    { label: 'Departments', path: `${baseRoute}/departments`, icon: Building2, roles: ['admin'] },
    { label: 'Attendance', path: `${baseRoute}/attendance`, icon: Calendar, roles: ['admin', 'manager', 'employee'] },
    { label: 'Leaves', path: `${baseRoute}/leaves`, icon: ClipboardList, roles: ['admin', 'manager', 'employee'] },
    { label: 'Payroll', path: `${baseRoute}/payroll`, icon: Wallet, roles: ['admin'] },
    { label: 'Payslips', path: `${baseRoute}/payslips`, icon: Wallet, roles: ['employee'] }
  ];

  const systemItems = [
    { label: 'Reports', path: `${baseRoute}/reports`, icon: FileText, roles: ['admin'] },
    { label: 'Holidays', path: `${baseRoute}/holidays`, icon: Calendar, roles: ['admin'] },
    { label: 'Activity Log', path: `${baseRoute}/activity`, icon: Activity, roles: ['admin'] },
    { label: 'Settings', path: `${baseRoute}/settings`, icon: Settings, roles: ['admin'] },
    { label: 'Profile', path: `${baseRoute}/profile`, icon: User, roles: ['employee'] }
  ];

  const filteredHrItems = hrItems.filter(item => item.roles.includes(role || 'employee'));
  const filteredSystemItems = systemItems.filter(item => item.roles.includes(role || 'employee'));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-0 h-full w-60 z-50 transform transition-all duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ background: '#1E293B', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="relative p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/change-management.png" alt="HRConnect" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-tight">HRConnect</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">System</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-2 space-y-0.5 overflow-y-auto h-[calc(100%-180px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}

          {filteredHrItems.length > 0 && (
            <div className="pt-3">
              <button
                onClick={() => setHrMenuOpen(!hrMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
              >
                <span>HR</span>
                {hrMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <div className={`space-y-0.5 mt-1 overflow-hidden transition-all duration-200 ${hrMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {filteredHrItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                        isActive
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {filteredSystemItems.length > 0 && (
            <div className="pt-3">
              <button
                onClick={() => setSystemMenuOpen(!systemMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
              >
                <span>System</span>
                {systemMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <div className={`space-y-0.5 mt-1 overflow-hidden transition-all duration-200 ${systemMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {filteredSystemItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                        isActive
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
              <img src="/change-management.png" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.employee?.first_name} {user?.employee?.last_name}</p>
              <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
