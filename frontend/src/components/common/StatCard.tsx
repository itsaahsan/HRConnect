import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps { title: string; value: string | number; icon: LucideIcon; color: string; change?: string; }

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change }) => {
  const colors: Record<string, { bg: string; icon: string; glow: string }> = {
    blue: { bg: 'rgba(59,130,246,0.12)', icon: '#60A5FA', glow: 'rgba(59,130,246,0.04)' },
    green: { bg: 'rgba(16,185,129,0.12)', icon: '#34D399', glow: 'rgba(16,185,129,0.04)' },
    yellow: { bg: 'rgba(245,158,11,0.12)', icon: '#FBBF24', glow: 'rgba(245,158,11,0.04)' },
    purple: { bg: 'rgba(139,92,246,0.12)', icon: '#A78BFA', glow: 'rgba(139,92,246,0.04)' },
    red: { bg: 'rgba(239,68,68,0.12)', icon: '#F87171', glow: 'rgba(239,68,68,0.04)' },
    cyan: { bg: 'rgba(6,182,212,0.12)', icon: '#22D3EE', glow: 'rgba(6,182,212,0.04)' }
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="relative overflow-hidden rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5" style={{ background: c.glow, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-white mt-1">{value}</p>
          {change && <p className="text-xs text-slate-500 mt-0.5">{change}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
          <Icon className="w-5 h-5" style={{ color: c.icon }} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
