'use client';
import { useMemo, useState } from 'react';
import { Indicator } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { pct } from '@/lib/ui/format';

export function IndicatorTable({ indicators }: { indicators: Indicator[] }) {
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const rows = useMemo(() => indicators.filter((i) => (status === 'all' || i.status === status) && (category === 'all' || i.category === category)), [indicators, status, category]);

  return <div className='space-y-3'>
    <div className='flex gap-2 text-sm'>
      <select className='rounded border p-1' value={category} onChange={(e) => setCategory(e.target.value)}><option value='all'>Toutes catégories</option>{[...new Set(indicators.map((x) => x.category))].map((c) => <option key={c}>{c}</option>)}</select>
      <select className='rounded border p-1' value={status} onChange={(e) => setStatus(e.target.value)}><option value='all'>Tous statuts</option><option value='live'>live</option><option value='mock'>mock</option><option value='stale'>stale</option><option value='error'>error</option></select>
    </div>
    <table className='w-full text-sm'><thead><tr className='text-left'><th>Catégorie</th><th>Label</th><th>Valeur</th><th>1D</th><th>7D</th><th>30D</th><th>Source</th><th>Status</th><th>Date</th></tr></thead><tbody>{rows.map((i)=><tr key={i.id} className='border-t'><td>{i.category}</td><td>{i.label}</td><td>{i.value ?? 'n/a'} {i.unit}</td><td>{pct(i.change1d)}</td><td>{pct(i.change7d)}</td><td>{pct(i.change30d)}</td><td>{i.source}</td><td><StatusBadge status={i.status} /></td><td>{i.date ?? 'n/a'}</td></tr>)}</tbody></table>
  </div>;
}
