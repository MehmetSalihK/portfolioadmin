import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface StatsChartProps {
  data: { name: string; value: number }[];
  type?: 'pie' | 'bar';
  title?: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function StatsChart({ data, type = 'pie', title }: StatsChartProps) {
  const { theme } = useTheme();
  
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={105}
              fill="#8884d8"
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(9, 9, 15, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '12px 16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#ffffff' }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest dark:text-zinc-500 text-zinc-400">{value}</span>}
            />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(9, 9, 15, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '12px 16px'
              }}
            />
            <Bar dataKey="value" radius={12} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
