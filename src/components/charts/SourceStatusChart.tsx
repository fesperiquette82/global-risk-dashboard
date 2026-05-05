'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const colors: Record<string, string> = { live: '#10b981', mock: '#64748b', stale: '#f59e0b', error: '#ef4444' };
export function SourceStatusChart({ data }: { data: { name: string; value: number }[] }) {
  return <div className='h-64'><ResponsiveContainer width='100%' height='100%'><PieChart><Pie data={data} dataKey='value' nameKey='name' outerRadius={90}>{data.map((d) => <Cell key={d.name} fill={colors[d.name] ?? '#94a3b8'} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>;
}
