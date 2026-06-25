import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmployeeBarChartProps { data: { name: string; count: number }[]; }

const EmployeeBarChart: React.FC<EmployeeBarChartProps> = ({ data }) => (
  <div className="card">
    <h3 className="text-sm font-semibold text-slate-300 mb-4">Employees by Department</h3>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
        <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E2E8F0' }} />
        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default EmployeeBarChart;
