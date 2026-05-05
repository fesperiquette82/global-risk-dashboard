import { DataSourceStatus } from '@/lib/types';

export const regimeColor = (regime: string) => {
  switch (regime) {
    case 'Risk-on': return 'bg-emerald-100 text-emerald-700';
    case 'Normal': return 'bg-blue-100 text-blue-700';
    case 'Fragile': return 'bg-amber-100 text-amber-700';
    case 'Stress élevé': return 'bg-orange-100 text-orange-700';
    default: return 'bg-red-100 text-red-700';
  }
};

export const biasColor = (bias: 'bullish' | 'neutral' | 'bearish') =>
  bias === 'bullish' ? 'bg-emerald-100 text-emerald-700' : bias === 'neutral' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700';

export const statusColor = (status: DataSourceStatus) =>
  status === 'live' ? 'bg-emerald-100 text-emerald-700' :
  status === 'mock' ? 'bg-slate-100 text-slate-700' :
  status === 'stale' ? 'bg-amber-100 text-amber-700' :
  'bg-red-100 text-red-700';

export const pct = (v: number | null | undefined) => (v ?? 0).toFixed(1);
