'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function StressBarChart({ scores }: { scores: { name: string; value: number }[] }) {
  return <div className='h-64'><ResponsiveContainer width='100%' height='100%'><BarChart data={scores}><XAxis dataKey='name' /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey='value' fill='#0f172a' /></BarChart></ResponsiveContainer></div>;
}
