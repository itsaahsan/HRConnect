import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AttendanceLineChartProps { data: { date: string; present: number; late: number }[]; }

const AttendanceLineChart: React.FC<AttendanceLineChartProps> = ({ data }) => (
  <div className="card">
    <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Attendance</h3>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
        <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E2E8F0' }} />
        <Legend wrapperStyle={{ color: '#94A3B8' }} />
        <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default AttendanceLineChart;
