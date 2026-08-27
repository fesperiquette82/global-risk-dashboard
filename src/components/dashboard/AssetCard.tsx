import { AssetSignal } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

const trendColor = (t: AssetSignal['trend']) =>
  t === 'haussière' ? 'text-emerald-700' : t === 'baissière' ? 'text-red-700' : 'text-slate-700';

const signed = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

export function AssetCard({ signal: s }: { signal: AssetSignal }) {
  return <div className='rounded border bg-white p-3'>
    <div className='mb-2 flex items-center justify-between'>
      <h3 className='font-medium'>{s.ticker} <span className='text-xs font-normal text-slate-500'>{s.name}</span></h3>
      <StatusBadge status={s.status} />
    </div>
    <p className='text-sm'>Prix: <b>{s.price !== null ? `${s.price.toFixed(2)} USD` : 'n/a'}</b>{s.changePct1d !== null && ` (${signed(s.changePct1d)} 1J)`}</p>
    <p className={`text-sm ${trendColor(s.trend)}`}>Tendance: <b>{s.trend}</b>{s.priceVsSma50Pct !== null && ` (${signed(s.priceVsSma50Pct)} vs MM50)`}</p>
    <p className='text-sm'>Momentum 3M: {s.return3m !== null ? signed(s.return3m) : 'n/a'}</p>
    <p className='text-sm'>Volatilité réalisée (ann.): {s.realizedVolAnnualizedPct !== null ? `${s.realizedVolAnnualizedPct.toFixed(1)}%` : 'n/a'}</p>
    <p className='text-sm'>P/E: {s.peRatio ?? 'n/a'} · Dividende: {s.dividendYieldPct !== null ? `${s.dividendYieldPct.toFixed(2)}%` : 'n/a'}</p>
    <p className='text-xs text-slate-600'>Range 52 sem.: {s.week52Low ?? 'n/a'} – {s.week52High ?? 'n/a'}</p>
    <p className='mt-1 text-xs text-slate-500'>{s.asOf ? `Clôture au ${s.asOf}` : 'Donnée non disponible'}</p>
  </div>;
}
