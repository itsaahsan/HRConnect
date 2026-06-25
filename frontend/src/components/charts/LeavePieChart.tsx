import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LeavePieChartProps { data: { name: string; value: number }[]; }
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const LeavePieChart: React.FC<LeavePieChartProps> = ({ data }) => (
  <div className="card">
    <h3 className="text-sm font-semibold text-slate-300 mb-4">Leave Distribution</h3>
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E2E8F0' }} />
        <Legend wrapperStyle={{ color: '#94A3B8' }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default LeavePieChart;
