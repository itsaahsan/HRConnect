import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Shield, Database, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [companyName, setCompanyName] = useState('HRConnect');
  const [companyEmail, setCompanyEmail] = useState('admin@hrconnect.com');
  const [timezone, setTimezone] = useState('Asia/Dhaka');
  const [currency, setCurrency] = useState('BDT');
  const [annualLeave, setAnnualLeave] = useState('20');
  const [sickLeave, setSickLeave] = useState('10');

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-gray-300" />
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="card">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Appearance
        </h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            <div>
              <p className="text-sm font-semibold text-white">Dark Mode</p>
              <p className="text-xs text-gray-400">Toggle dark theme</p>
            </div>
          </div>
          <button onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-purple-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 mt-0.5 ${isDark ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Company Name</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Company Email</label>
            <input value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input-field">
              <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field">
              <option value="BDT">BDT (Taka)</option>
              <option value="USD">USD (Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" /> Leave Policy Defaults
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Annual Leave (days/year)</label>
            <input type="number" value={annualLeave} onChange={e => setAnnualLeave(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Sick Leave (days/year)</label>
            <input type="number" value={sickLeave} onChange={e => setSickLeave(e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" /> System Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-gray-400">Version</p>
            <p className="text-sm font-bold text-white">1.0.0</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-gray-400">Backend</p>
            <p className="text-sm font-bold text-white">Node.js + Express</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-gray-400">Database</p>
            <p className="text-sm font-bold text-white">PostgreSQL</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-gray-400">Frontend</p>
            <p className="text-sm font-bold text-white">React + TypeScript</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">Save Settings</button>
      </div>
    </div>
  );
};

export default AdminSettings;
